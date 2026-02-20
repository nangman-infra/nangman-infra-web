import { DownloadMemberPortfolioPdfByJobUseCase } from './download-member-portfolio-pdf-by-job.use-case';
import {
  MemberPortfolioJobNotFoundError,
  MemberPortfolioJobNotReadyError,
} from '../../domain/errors/member-portfolio.error';
import { MemberPortfolioJobManagerPort } from '../../domain/ports/member-portfolio-job-manager.port';

describe('DownloadMemberPortfolioPdfByJobUseCase', () => {
  const mockJobManager: MemberPortfolioJobManagerPort = {
    start: jest.fn(),
    get: jest.fn(),
    getDocument: jest.fn(),
  };

  let useCase: DownloadMemberPortfolioPdfByJobUseCase;

  beforeEach(() => {
    useCase = new DownloadMemberPortfolioPdfByJobUseCase(mockJobManager);
    jest.clearAllMocks();
  });

  it('should return document when job is completed', async () => {
    (mockJobManager.get as jest.Mock).mockResolvedValue({
      jobId: 'job-1',
      status: 'completed',
      message: 'done',
      createdAt: '2026-02-20T00:00:00.000Z',
      updatedAt: '2026-02-20T00:00:05.000Z',
    });
    (mockJobManager.getDocument as jest.Mock).mockResolvedValue({
      fileName: 'seongwon-portfolio.pdf',
      contentType: 'application/pdf',
      content: Buffer.from('pdf'),
    });

    const result = await useCase.execute('job-1');

    expect(result.fileName).toBe('seongwon-portfolio.pdf');
  });

  it('should throw conflict when job is still running', async () => {
    (mockJobManager.get as jest.Mock).mockResolvedValue({
      jobId: 'job-1',
      status: 'running',
      message: 'running',
      createdAt: '2026-02-20T00:00:00.000Z',
      updatedAt: '2026-02-20T00:00:02.000Z',
    });

    await expect(useCase.execute('job-1')).rejects.toThrow(
      MemberPortfolioJobNotReadyError,
    );
  });

  it('should throw not found when job is missing', async () => {
    (mockJobManager.get as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(
      MemberPortfolioJobNotFoundError,
    );
  });
});
