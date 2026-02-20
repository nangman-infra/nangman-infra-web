import { ConflictException, NotFoundException } from '@nestjs/common';
import { DownloadMemberPortfolioPdfByJobUseCase } from './application/use-cases/download-member-portfolio-pdf-by-job.use-case';
import { DownloadMemberPortfolioPdfUseCase } from './application/use-cases/download-member-portfolio-pdf.use-case';
import { GetAllMembersUseCase } from './application/use-cases/get-all-members.use-case';
import { GetMemberPortfolioPdfJobStatusUseCase } from './application/use-cases/get-member-portfolio-pdf-job-status.use-case';
import { StartMemberPortfolioPdfJobUseCase } from './application/use-cases/start-member-portfolio-pdf-job.use-case';
import {
  MemberNotFoundError,
  MemberPortfolioJobNotFoundError,
  MemberPortfolioJobNotReadyError,
} from './domain/errors/member-portfolio.error';
import { MembersService } from './members.service';

describe('MembersService', () => {
  const mockGetAllMembersUseCase = {
    execute: jest.fn(),
  } as unknown as GetAllMembersUseCase;
  const mockDownloadMemberPortfolioPdfUseCase = {
    execute: jest.fn(),
  } as unknown as DownloadMemberPortfolioPdfUseCase;
  const mockStartMemberPortfolioPdfJobUseCase = {
    execute: jest.fn(),
  } as unknown as StartMemberPortfolioPdfJobUseCase;
  const mockGetMemberPortfolioPdfJobStatusUseCase = {
    execute: jest.fn(),
  } as unknown as GetMemberPortfolioPdfJobStatusUseCase;
  const mockDownloadMemberPortfolioPdfByJobUseCase = {
    execute: jest.fn(),
  } as unknown as DownloadMemberPortfolioPdfByJobUseCase;

  let service: MembersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MembersService(
      mockGetAllMembersUseCase,
      mockDownloadMemberPortfolioPdfUseCase,
      mockStartMemberPortfolioPdfJobUseCase,
      mockGetMemberPortfolioPdfJobStatusUseCase,
      mockDownloadMemberPortfolioPdfByJobUseCase,
    );
  });

  it('should map missing member error to NotFoundException', async () => {
    (
      mockDownloadMemberPortfolioPdfUseCase.execute as jest.Mock
    ).mockRejectedValue(new MemberNotFoundError());

    await expect(service.downloadPortfolioPdf('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should map missing job error to NotFoundException', async () => {
    (
      mockGetMemberPortfolioPdfJobStatusUseCase.execute as jest.Mock
    ).mockRejectedValue(new MemberPortfolioJobNotFoundError());

    await expect(service.getPortfolioPdfJobStatus('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should map not-ready job error to ConflictException', async () => {
    (
      mockDownloadMemberPortfolioPdfByJobUseCase.execute as jest.Mock
    ).mockRejectedValue(new MemberPortfolioJobNotReadyError());

    await expect(service.downloadPortfolioPdfByJob('job-1')).rejects.toThrow(
      ConflictException,
    );
  });
});
