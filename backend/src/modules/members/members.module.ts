import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { GetAllMembersUseCase } from './application/use-cases/get-all-members.use-case';
import { MEMBER_READER } from './domain/ports/member-reader.port';
import { DirectusMembersReaderAdapter } from './infrastructure/directus/directus-members-reader.adapter';
import { DownloadMemberPortfolioPdfUseCase } from './application/use-cases/download-member-portfolio-pdf.use-case';
import { PdfMemberPortfolioRendererAdapter } from './infrastructure/pdf/pdf-member-portfolio-renderer.adapter';
import { MEMBER_PORTFOLIO_RENDERER } from './domain/ports/member-portfolio-renderer.port';
import { ResolveMemberPortfolioTargetUseCase } from './application/use-cases/resolve-member-portfolio-target.use-case';
import { StartMemberPortfolioPdfJobUseCase } from './application/use-cases/start-member-portfolio-pdf-job.use-case';
import { GetMemberPortfolioPdfJobStatusUseCase } from './application/use-cases/get-member-portfolio-pdf-job-status.use-case';
import { DownloadMemberPortfolioPdfByJobUseCase } from './application/use-cases/download-member-portfolio-pdf-by-job.use-case';
import { MEMBER_PORTFOLIO_JOB_MANAGER } from './domain/ports/member-portfolio-job-manager.port';
import { WorkerThreadMemberPortfolioJobManagerAdapter } from './infrastructure/pdf/worker-thread-member-portfolio-job-manager.adapter';

@Module({
  controllers: [MembersController],
  providers: [
    MembersService,
    GetAllMembersUseCase,
    ResolveMemberPortfolioTargetUseCase,
    DownloadMemberPortfolioPdfUseCase,
    StartMemberPortfolioPdfJobUseCase,
    GetMemberPortfolioPdfJobStatusUseCase,
    DownloadMemberPortfolioPdfByJobUseCase,
    DirectusMembersReaderAdapter,
    PdfMemberPortfolioRendererAdapter,
    WorkerThreadMemberPortfolioJobManagerAdapter,
    {
      provide: MEMBER_READER,
      useExisting: DirectusMembersReaderAdapter,
    },
    {
      provide: MEMBER_PORTFOLIO_RENDERER,
      useExisting: PdfMemberPortfolioRendererAdapter,
    },
    {
      provide: MEMBER_PORTFOLIO_JOB_MANAGER,
      useExisting: WorkerThreadMemberPortfolioJobManagerAdapter,
    },
  ],
})
export class MembersModule {}
