import { Inject, Injectable } from '@nestjs/common';
import {
  MemberPortfolioDocumentNotFoundError,
  MemberPortfolioJobFailedError,
  MemberPortfolioJobNotFoundError,
  MemberPortfolioJobNotReadyError,
} from '../../domain/errors/member-portfolio.error';
import { MemberPortfolioDocument } from '../../domain/models/member-portfolio-document.model';
import {
  MEMBER_PORTFOLIO_JOB_MANAGER,
  MemberPortfolioJobManagerPort,
} from '../../domain/ports/member-portfolio-job-manager.port';

@Injectable()
export class DownloadMemberPortfolioPdfByJobUseCase {
  constructor(
    @Inject(MEMBER_PORTFOLIO_JOB_MANAGER)
    private readonly memberPortfolioJobManager: MemberPortfolioJobManagerPort,
  ) {}

  async execute(jobId: string): Promise<MemberPortfolioDocument> {
    const job = await this.memberPortfolioJobManager.get(jobId);

    if (!job) {
      throw new MemberPortfolioJobNotFoundError();
    }

    if (job.status === 'failed') {
      throw new MemberPortfolioJobFailedError(job.errorMessage);
    }

    if (job.status !== 'completed') {
      throw new MemberPortfolioJobNotReadyError();
    }

    const document = await this.memberPortfolioJobManager.getDocument(jobId);
    if (!document) {
      throw new MemberPortfolioDocumentNotFoundError();
    }

    return document;
  }
}
