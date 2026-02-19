import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { MembersService } from './members.service';
import { MemberProfile } from './domain/member-profile';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get(':slug/portfolio/pdf')
  async downloadPortfolioPdf(
    @Param('slug') slug: string,
    @Res() response: Response,
  ): Promise<void> {
    const portfolio = await this.membersService.downloadPortfolioPdf(slug);

    response.setHeader('Content-Type', portfolio.contentType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${portfolio.fileName}"`,
    );
    response.setHeader('Cache-Control', 'no-store');
    response.status(200).send(portfolio.content);
  }

  @Get()
  async getAllMembers(): Promise<MemberProfile[]> {
    return this.membersService.getAll();
  }
}
