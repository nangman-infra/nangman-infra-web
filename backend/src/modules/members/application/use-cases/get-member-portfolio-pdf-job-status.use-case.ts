import { Inject, Injectable } from '@nestjs/common';
import { MemberPortfolioJobNotFoundError } from '../../domain/errors/member-portfolio.error';
import { MemberPortfolioJobSnapshot } from '../../domain/models/member-portfolio-job.model';
import {
  MEMBER_PORTFOLIO_JOB_MANAGER,
  MemberPortfolioJobManagerPort,
} from '../../domain/ports/member-portfolio-job-manager.port';

@Injectable()
export class GetMemberPortfolioPdfJobStatusUseCase {
  constructor(
    @Inject(MEMBER_PORTFOLIO_JOB_MANAGER)
    private readonly memberPortfolioJobManager: MemberPortfolioJobManagerPort,
  ) {}

  async execute(jobId: string): Promise<MemberPortfolioJobSnapshot> {
    const job = await this.memberPortfolioJobManager.get(jobId);

    if (!job) {
      throw new MemberPortfolioJobNotFoundError();
    }

    return job;
  }
}
