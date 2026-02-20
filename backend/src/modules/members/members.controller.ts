import { Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { MembersService } from './members.service';
import { MemberProfile } from './domain/member-profile';
import { MemberPortfolioJobSnapshot } from './domain/models/member-portfolio-job.model';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post(':slug/portfolio/pdf/jobs')
  async startPortfolioPdfJob(
    @Param('slug') slug: string,
  ): Promise<MemberPortfolioJobSnapshot> {
    return this.membersService.startPortfolioPdfJob(slug);
  }

  @Get('portfolio/pdf/jobs/:jobId')
  async getPortfolioPdfJobStatus(
    @Param('jobId') jobId: string,
  ): Promise<MemberPortfolioJobSnapshot> {
    return this.membersService.getPortfolioPdfJobStatus(jobId);
  }

  @Get('portfolio/pdf/jobs/:jobId/download')
  async downloadPortfolioPdfByJob(
    @Param('jobId') jobId: string,
    @Res() response: Response,
  ): Promise<void> {
    const portfolio =
      await this.membersService.downloadPortfolioPdfByJob(jobId);

    response.setHeader('Content-Type', portfolio.contentType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${portfolio.fileName}"`,
    );
    response.setHeader('Cache-Control', 'no-store');
    response.status(200).send(portfolio.content);
  }

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
