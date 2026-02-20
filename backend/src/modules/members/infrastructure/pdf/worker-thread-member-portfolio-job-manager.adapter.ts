import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { availableParallelism, cpus } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { MemberProfile } from '../../domain/member-profile';
import { MemberPortfolioDocument } from '../../domain/models/member-portfolio-document.model';
import { MemberPortfolioJobSnapshot } from '../../domain/models/member-portfolio-job.model';
import {
  MemberPortfolioJobManagerPort,
  StartMemberPortfolioJobInput,
} from '../../domain/ports/member-portfolio-job-manager.port';

interface InternalJob {
  jobKey: string;
  member: MemberProfile;
  fileName: string;
  contentType: string;
  snapshot: MemberPortfolioJobSnapshot;
  expiresAt: number | null;
}

interface WorkerSuccessMessage {
  ok: true;
  content: Uint8Array;
}

interface WorkerErrorMessage {
  ok: false;
  error: string;
}

type WorkerMessage = WorkerSuccessMessage | WorkerErrorMessage;

const DEFAULT_JOB_TTL_MS = 30 * 60 * 1000;
const DEFAULT_WORKER_TIMEOUT_MS = 5 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;
const RESERVED_MAIN_THREAD_CORES = 1;
const MAX_AUTO_WORKERS = 6;

@Injectable()
export class WorkerThreadMemberPortfolioJobManagerAdapter
  implements MemberPortfolioJobManagerPort, OnModuleDestroy
{
  private readonly logger = new Logger(
    WorkerThreadMemberPortfolioJobManagerAdapter.name,
  );
  private readonly jobsById = new Map<string, InternalJob>();
  private readonly jobIdByKey = new Map<string, string>();
  private readonly documentsByJobId = new Map<string, Buffer>();
  private readonly queue: string[] = [];
  private readonly activeWorkersByJobId = new Map<string, Worker>();
  private readonly workerScriptPath = join(
    __dirname,
    'member-portfolio-render.worker.js',
  );
  private readonly cleanupInterval: NodeJS.Timeout;
  private readonly workerCount: number;
  private readonly jobTtlMs: number;
  private readonly workerTimeoutMs: number;
  private activeWorkers = 0;

  constructor(private readonly configService: ConfigService) {
    this.workerCount = this.resolveWorkerCount();
    this.jobTtlMs = this.resolvePositiveNumber(
      'MEMBER_PDF_JOB_TTL_MS',
      DEFAULT_JOB_TTL_MS,
    );
    this.workerTimeoutMs = this.resolvePositiveNumber(
      'MEMBER_PDF_WORKER_TIMEOUT_MS',
      DEFAULT_WORKER_TIMEOUT_MS,
    );
    this.cleanupInterval = setInterval(
      () => this.cleanupExpiredJobs(),
      CLEANUP_INTERVAL_MS,
    );
    this.cleanupInterval.unref();

    this.logger.log(
      `Member portfolio worker pool initialized: workers=${this.workerCount}, ttlMs=${this.jobTtlMs}, timeoutMs=${this.workerTimeoutMs}`,
    );
  }

  async start(
    input: StartMemberPortfolioJobInput,
  ): Promise<MemberPortfolioJobSnapshot> {
    this.cleanupExpiredJobs();

    const existingJobId = this.jobIdByKey.get(input.jobKey);
    if (existingJobId) {
      const existing = this.jobsById.get(existingJobId);
      if (
        existing &&
        (existing.snapshot.status === 'queued' ||
          existing.snapshot.status === 'running' ||
          existing.snapshot.status === 'completed')
      ) {
        return this.cloneSnapshot(existing.snapshot);
      }
    }

    const now = new Date().toISOString();
    const jobId = randomUUID();
    const snapshot: MemberPortfolioJobSnapshot = {
      jobId,
      status: 'queued',
      message: '포트폴리오 PDF 생성 작업을 대기열에 등록했습니다.',
      createdAt: now,
      updatedAt: now,
      fileName: input.fileName,
      contentType: input.contentType,
    };

    const job: InternalJob = {
      jobKey: input.jobKey,
      member: input.member,
      fileName: input.fileName,
      contentType: input.contentType,
      snapshot,
      expiresAt: null,
    };

    this.jobsById.set(jobId, job);
    this.jobIdByKey.set(input.jobKey, jobId);
    this.queue.push(jobId);
    this.processQueue();

    return this.cloneSnapshot(snapshot);
  }

  async get(jobId: string): Promise<MemberPortfolioJobSnapshot | null> {
    this.cleanupExpiredJobs();
    const job = this.jobsById.get(jobId);
    if (!job) {
      return null;
    }

    return this.cloneSnapshot(job.snapshot);
  }

  async getDocument(jobId: string): Promise<MemberPortfolioDocument | null> {
    this.cleanupExpiredJobs();

    const job = this.jobsById.get(jobId);
    if (!job || job.snapshot.status !== 'completed') {
      return null;
    }

    const content = this.documentsByJobId.get(jobId);
    if (!content) {
      return null;
    }

    return {
      fileName: job.fileName,
      contentType: job.contentType,
      content: Buffer.from(content),
    };
  }

  async onModuleDestroy(): Promise<void> {
    clearInterval(this.cleanupInterval);

    await Promise.all(
      Array.from(this.activeWorkersByJobId.values()).map((worker) =>
        worker.terminate().catch(() => 0),
      ),
    );
    this.activeWorkersByJobId.clear();
  }

  private processQueue(): void {
    while (this.activeWorkers < this.workerCount && this.queue.length > 0) {
      const jobId = this.queue.shift();
      if (!jobId) {
        continue;
      }

      const job = this.jobsById.get(jobId);
      if (!job || job.snapshot.status !== 'queued') {
        continue;
      }

      void this.runJob(jobId, job);
    }
  }

  private async runJob(jobId: string, job: InternalJob): Promise<void> {
    this.activeWorkers += 1;
    this.updateSnapshot(
      job,
      'running',
      '서버에서 포트폴리오 PDF를 생성하고 있습니다.',
    );

    let worker: Worker | null = null;

    try {
      worker = new Worker(this.workerScriptPath);
      this.activeWorkersByJobId.set(jobId, worker);
      const content = await this.renderInWorker(worker, job.member);
      this.documentsByJobId.set(jobId, content);
      this.updateSnapshot(
        job,
        'completed',
        '포트폴리오 PDF 생성이 완료되었습니다.',
      );
      job.expiresAt = Date.now() + this.jobTtlMs;
    } catch (error) {
      this.documentsByJobId.delete(jobId);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '포트폴리오 PDF 생성 중 오류가 발생했습니다.';
      this.updateSnapshot(
        job,
        'failed',
        '포트폴리오 PDF 생성에 실패했습니다.',
        errorMessage,
      );
      job.expiresAt = Date.now() + this.jobTtlMs;
      this.logger.error('Failed to render member portfolio in worker', {
        jobId,
        error: errorMessage,
      });
    } finally {
      if (worker) {
        await worker.terminate().catch(() => 0);
        this.activeWorkersByJobId.delete(jobId);
      }
      this.activeWorkers -= 1;
      this.processQueue();
    }
  }

  private renderInWorker(
    worker: Worker,
    member: MemberProfile,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        void worker.terminate().catch(() => 0);
        reject(new Error('포트폴리오 PDF 생성 시간이 초과되었습니다.'));
      }, this.workerTimeoutMs);

      const cleanupListeners = (): void => {
        clearTimeout(timeoutId);
        worker.removeAllListeners('message');
        worker.removeAllListeners('error');
        worker.removeAllListeners('exit');
      };

      worker.once('message', (message: WorkerMessage) => {
        cleanupListeners();

        if (!message || typeof message !== 'object' || !('ok' in message)) {
          reject(new Error('포트폴리오 워커 응답 형식이 올바르지 않습니다.'));
          return;
        }

        if (!message.ok) {
          reject(
            new Error(
              message.error ||
                '포트폴리오 PDF 생성 중 알 수 없는 오류가 발생했습니다.',
            ),
          );
          return;
        }

        resolve(Buffer.from(message.content));
      });

      worker.once('error', (error: Error) => {
        cleanupListeners();
        reject(error);
      });

      worker.once('exit', (code: number) => {
        if (code === 0) {
          return;
        }
        cleanupListeners();
        reject(
          new Error(`포트폴리오 워커가 비정상 종료되었습니다. code=${code}`),
        );
      });

      worker.postMessage({ member });
    });
  }

  private updateSnapshot(
    job: InternalJob,
    status: MemberPortfolioJobSnapshot['status'],
    message: string,
    errorMessage?: string,
  ): void {
    job.snapshot.status = status;
    job.snapshot.message = message;
    job.snapshot.updatedAt = new Date().toISOString();

    if (errorMessage) {
      job.snapshot.errorMessage = errorMessage;
    } else {
      delete job.snapshot.errorMessage;
    }
  }

  private cleanupExpiredJobs(): void {
    const now = Date.now();

    for (const [jobId, job] of this.jobsById.entries()) {
      if (!job.expiresAt || job.expiresAt > now) {
        continue;
      }

      this.jobsById.delete(jobId);
      this.documentsByJobId.delete(jobId);
      if (this.jobIdByKey.get(job.jobKey) === jobId) {
        this.jobIdByKey.delete(job.jobKey);
      }
    }
  }

  private cloneSnapshot(
    snapshot: MemberPortfolioJobSnapshot,
  ): MemberPortfolioJobSnapshot {
    return { ...snapshot };
  }

  private resolveWorkerCount(): number {
    const configured = this.resolveNonNegativeNumber(
      'MEMBER_PDF_WORKER_COUNT',
      0,
    );
    if (configured > 0) {
      return configured;
    }

    const availableCores = this.getAvailableCoreCount();
    const autoWorkers = Math.max(
      1,
      Math.min(availableCores - RESERVED_MAIN_THREAD_CORES, MAX_AUTO_WORKERS),
    );
    return autoWorkers;
  }

  private getAvailableCoreCount(): number {
    try {
      return availableParallelism();
    } catch {
      return cpus().length;
    }
  }

  private resolvePositiveNumber(key: string, fallback: number): number {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }

  private resolveNonNegativeNumber(key: string, fallback: number): number {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return fallback;
    }

    return parsed;
  }
}
