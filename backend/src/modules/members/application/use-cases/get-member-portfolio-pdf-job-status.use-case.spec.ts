import { GetMemberPortfolioPdfJobStatusUseCase } from './get-member-portfolio-pdf-job-status.use-case';
import { MemberPortfolioJobNotFoundError } from '../../domain/errors/member-portfolio.error';
import { MemberPortfolioJobManagerPort } from '../../domain/ports/member-portfolio-job-manager.port';

describe('GetMemberPortfolioPdfJobStatusUseCase', () => {
  const mockJobManager: MemberPortfolioJobManagerPort = {
    start: jest.fn(),
    get: jest.fn(),
    getDocument: jest.fn(),
  };

  let useCase: GetMemberPortfolioPdfJobStatusUseCase;

  beforeEach(() => {
    useCase = new GetMemberPortfolioPdfJobStatusUseCase(mockJobManager);
    jest.clearAllMocks();
  });

  it('should return job status', async () => {
    (mockJobManager.get as jest.Mock).mockResolvedValue({
      jobId: 'job-1',
      status: 'running',
      message: 'running',
      createdAt: '2026-02-20T00:00:00.000Z',
      updatedAt: '2026-02-20T00:00:01.000Z',
    });

    const result = await useCase.execute('job-1');

    expect(result.status).toBe('running');
  });

  it('should throw not found when job does not exist', async () => {
    (mockJobManager.get as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(
      MemberPortfolioJobNotFoundError,
    );
  });
});
