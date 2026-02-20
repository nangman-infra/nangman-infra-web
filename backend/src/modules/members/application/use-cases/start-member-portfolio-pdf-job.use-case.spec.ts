import { StartMemberPortfolioPdfJobUseCase } from './start-member-portfolio-pdf-job.use-case';
import { ResolveMemberPortfolioTargetUseCase } from './resolve-member-portfolio-target.use-case';
import { MemberPortfolioJobManagerPort } from '../../domain/ports/member-portfolio-job-manager.port';

describe('StartMemberPortfolioPdfJobUseCase', () => {
  const mockResolveUseCase = {
    execute: jest.fn(),
  } as unknown as ResolveMemberPortfolioTargetUseCase;

  const mockJobManager: MemberPortfolioJobManagerPort = {
    start: jest.fn(),
    get: jest.fn(),
    getDocument: jest.fn(),
  };

  let useCase: StartMemberPortfolioPdfJobUseCase;

  beforeEach(() => {
    useCase = new StartMemberPortfolioPdfJobUseCase(
      mockResolveUseCase,
      mockJobManager,
    );
    jest.clearAllMocks();
  });

  it('should enqueue portfolio job with resolved target', async () => {
    (mockResolveUseCase.execute as jest.Mock).mockResolvedValue({
      member: {
        slug: 'seongwon',
        name: '이성원',
        role: 'Mentor',
        category: 'senior',
      },
      fileName: 'seongwon-portfolio.pdf',
      cacheKey: 'seongwon:hash',
    });
    (mockJobManager.start as jest.Mock).mockResolvedValue({
      jobId: 'job-1',
      status: 'queued',
      message: 'queued',
      createdAt: '2026-02-20T00:00:00.000Z',
      updatedAt: '2026-02-20T00:00:00.000Z',
    });

    const result = await useCase.execute('seongwon');

    expect(mockResolveUseCase.execute).toHaveBeenCalledWith('seongwon');
    expect(mockJobManager.start).toHaveBeenCalledWith(
      expect.objectContaining({
        jobKey: 'seongwon:hash',
        fileName: 'seongwon-portfolio.pdf',
        contentType: 'application/pdf',
      }),
    );
    expect(result.status).toBe('queued');
  });
});
