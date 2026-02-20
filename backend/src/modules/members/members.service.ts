import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetAllMembersUseCase } from './application/use-cases/get-all-members.use-case';
import { MemberProfile } from './domain/member-profile';
import { DownloadMemberPortfolioPdfUseCase } from './application/use-cases/download-member-portfolio-pdf.use-case';
import { MemberPortfolioDocument } from './domain/models/member-portfolio-document.model';
import { StartMemberPortfolioPdfJobUseCase } from './application/use-cases/start-member-portfolio-pdf-job.use-case';
import { MemberPortfolioJobSnapshot } from './domain/models/member-portfolio-job.model';
import { GetMemberPortfolioPdfJobStatusUseCase } from './application/use-cases/get-member-portfolio-pdf-job-status.use-case';
import { DownloadMemberPortfolioPdfByJobUseCase } from './application/use-cases/download-member-portfolio-pdf-by-job.use-case';
import {
  MemberNotFoundError,
  MemberPortfolioDocumentNotFoundError,
  MemberPortfolioJobFailedError,
  MemberPortfolioJobNotFoundError,
  MemberPortfolioJobNotReadyError,
} from './domain/errors/member-portfolio.error';

@Injectable()
export class MembersService {
  constructor(
    private readonly getAllMembersUseCase: GetAllMembersUseCase,
    private readonly downloadMemberPortfolioPdfUseCase: DownloadMemberPortfolioPdfUseCase,
    private readonly startMemberPortfolioPdfJobUseCase: StartMemberPortfolioPdfJobUseCase,
    private readonly getMemberPortfolioPdfJobStatusUseCase: GetMemberPortfolioPdfJobStatusUseCase,
    private readonly downloadMemberPortfolioPdfByJobUseCase: DownloadMemberPortfolioPdfByJobUseCase,
  ) {}

  async getAll(): Promise<MemberProfile[]> {
    return this.getAllMembersUseCase.execute();
  }

  async downloadPortfolioPdf(slug: string): Promise<MemberPortfolioDocument> {
    try {
      return await this.downloadMemberPortfolioPdfUseCase.execute(slug);
    } catch (error: unknown) {
      this.rethrowHttpException(error);
    }
  }

  async startPortfolioPdfJob(
    slug: string,
  ): Promise<MemberPortfolioJobSnapshot> {
    try {
      return await this.startMemberPortfolioPdfJobUseCase.execute(slug);
    } catch (error: unknown) {
      this.rethrowHttpException(error);
    }
  }

  async getPortfolioPdfJobStatus(
    jobId: string,
  ): Promise<MemberPortfolioJobSnapshot> {
    try {
      return await this.getMemberPortfolioPdfJobStatusUseCase.execute(jobId);
    } catch (error: unknown) {
      this.rethrowHttpException(error);
    }
  }

  async downloadPortfolioPdfByJob(
    jobId: string,
  ): Promise<MemberPortfolioDocument> {
    try {
      return await this.downloadMemberPortfolioPdfByJobUseCase.execute(jobId);
    } catch (error: unknown) {
      this.rethrowHttpException(error);
    }
  }

  private rethrowHttpException(error: unknown): never {
    if (
      error instanceof MemberNotFoundError ||
      error instanceof MemberPortfolioJobNotFoundError ||
      error instanceof MemberPortfolioDocumentNotFoundError
    ) {
      throw new NotFoundException(error.message);
    }

    if (
      error instanceof MemberPortfolioJobNotReadyError ||
      error instanceof MemberPortfolioJobFailedError
    ) {
      throw new ConflictException(error.message);
    }

    throw error;
  }
}
