import { Inject, Injectable } from '@nestjs/common';
import { MemberPortfolioJobSnapshot } from '../../domain/models/member-portfolio-job.model';
import {
  MEMBER_PORTFOLIO_JOB_MANAGER,
  MemberPortfolioJobManagerPort,
} from '../../domain/ports/member-portfolio-job-manager.port';
import { ResolveMemberPortfolioTargetUseCase } from './resolve-member-portfolio-target.use-case';

const PORTFOLIO_CONTENT_TYPE = 'application/pdf';

@Injectable()
export class StartMemberPortfolioPdfJobUseCase {
  constructor(
    private readonly resolveMemberPortfolioTargetUseCase: ResolveMemberPortfolioTargetUseCase,
    @Inject(MEMBER_PORTFOLIO_JOB_MANAGER)
    private readonly memberPortfolioJobManager: MemberPortfolioJobManagerPort,
  ) {}

  async execute(slug: string): Promise<MemberPortfolioJobSnapshot> {
    const target = await this.resolveMemberPortfolioTargetUseCase.execute(slug);

    return this.memberPortfolioJobManager.start({
      jobKey: target.cacheKey,
      member: target.member,
      fileName: target.fileName,
      contentType: PORTFOLIO_CONTENT_TYPE,
    });
  }
}
