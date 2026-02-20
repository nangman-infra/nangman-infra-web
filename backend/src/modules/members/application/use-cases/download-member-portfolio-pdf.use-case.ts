import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBER_PORTFOLIO_RENDERER,
  MemberPortfolioRendererPort,
} from '../../domain/ports/member-portfolio-renderer.port';
import { MemberPortfolioDocument } from '../../domain/models/member-portfolio-document.model';
import { ResolveMemberPortfolioTargetUseCase } from './resolve-member-portfolio-target.use-case';

const PORTFOLIO_CONTENT_TYPE = 'application/pdf';

@Injectable()
export class DownloadMemberPortfolioPdfUseCase {
  constructor(
    private readonly resolveMemberPortfolioTargetUseCase: ResolveMemberPortfolioTargetUseCase,
    @Inject(MEMBER_PORTFOLIO_RENDERER)
    private readonly memberPortfolioRenderer: MemberPortfolioRendererPort,
  ) {}

  async execute(slug: string): Promise<MemberPortfolioDocument> {
    const target = await this.resolveMemberPortfolioTargetUseCase.execute(slug);
    const content = await this.memberPortfolioRenderer.render(target.member);

    return {
      fileName: target.fileName,
      contentType: PORTFOLIO_CONTENT_TYPE,
      content,
    };
  }
}
