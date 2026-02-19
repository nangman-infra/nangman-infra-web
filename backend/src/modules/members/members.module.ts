import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { GetAllMembersUseCase } from './application/use-cases/get-all-members.use-case';
import { MEMBER_READER } from './domain/ports/member-reader.port';
import { DirectusMembersReaderAdapter } from './infrastructure/directus/directus-members-reader.adapter';
import { DownloadMemberPortfolioPdfUseCase } from './application/use-cases/download-member-portfolio-pdf.use-case';
import { PdfMemberPortfolioRendererAdapter } from './infrastructure/pdf/pdf-member-portfolio-renderer.adapter';
import { MEMBER_PORTFOLIO_RENDERER } from './domain/ports/member-portfolio-renderer.port';

@Module({
  controllers: [MembersController],
  providers: [
    MembersService,
    GetAllMembersUseCase,
    DownloadMemberPortfolioPdfUseCase,
    DirectusMembersReaderAdapter,
    PdfMemberPortfolioRendererAdapter,
    {
      provide: MEMBER_READER,
      useExisting: DirectusMembersReaderAdapter,
    },
    {
      provide: MEMBER_PORTFOLIO_RENDERER,
      useExisting: PdfMemberPortfolioRendererAdapter,
    },
  ],
})
export class MembersModule {}
