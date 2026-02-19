import { Injectable } from '@nestjs/common';
import { GetAllMembersUseCase } from './application/use-cases/get-all-members.use-case';
import { MemberProfile } from './domain/member-profile';
import { DownloadMemberPortfolioPdfUseCase } from './application/use-cases/download-member-portfolio-pdf.use-case';
import { MemberPortfolioDocument } from './domain/models/member-portfolio-document.model';

@Injectable()
export class MembersService {
  constructor(
    private readonly getAllMembersUseCase: GetAllMembersUseCase,
    private readonly downloadMemberPortfolioPdfUseCase: DownloadMemberPortfolioPdfUseCase,
  ) {}

  async getAll(): Promise<MemberProfile[]> {
    return this.getAllMembersUseCase.execute();
  }

  async downloadPortfolioPdf(slug: string): Promise<MemberPortfolioDocument> {
    return this.downloadMemberPortfolioPdfUseCase.execute(slug);
  }
}
