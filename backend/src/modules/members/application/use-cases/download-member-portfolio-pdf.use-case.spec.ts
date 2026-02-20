import { DownloadMemberPortfolioPdfUseCase } from './download-member-portfolio-pdf.use-case';
import { MemberPortfolioRendererPort } from '../../domain/ports/member-portfolio-renderer.port';
import { ResolveMemberPortfolioTargetUseCase } from './resolve-member-portfolio-target.use-case';

describe('DownloadMemberPortfolioPdfUseCase', () => {
  const mockResolveTargetUseCase = {
    execute: jest.fn(),
  } as unknown as ResolveMemberPortfolioTargetUseCase;

  const mockPortfolioRenderer: MemberPortfolioRendererPort = {
    render: jest.fn(),
  };

  let useCase: DownloadMemberPortfolioPdfUseCase;

  beforeEach(() => {
    useCase = new DownloadMemberPortfolioPdfUseCase(
      mockResolveTargetUseCase,
      mockPortfolioRenderer,
    );
    jest.clearAllMocks();
  });

  it('should render PDF with resolved target member and filename', async () => {
    const mockPdfBuffer = Buffer.from('portfolio-pdf');
    (mockResolveTargetUseCase.execute as jest.Mock).mockResolvedValue({
      member: {
        slug: 'seongwon',
        name: '이성원',
        role: 'Mentor',
        category: 'senior',
      },
      fileName: 'seongwon-portfolio.pdf',
      cacheKey: 'seongwon:hash',
    });
    (mockPortfolioRenderer.render as jest.Mock).mockResolvedValue(
      mockPdfBuffer,
    );

    const result = await useCase.execute('seongwon');

    expect(mockResolveTargetUseCase.execute).toHaveBeenCalledWith('seongwon');
    expect(mockPortfolioRenderer.render).toHaveBeenCalledWith({
      slug: 'seongwon',
      name: '이성원',
      role: 'Mentor',
      category: 'senior',
    });
    expect(result).toEqual({
      fileName: 'seongwon-portfolio.pdf',
      contentType: 'application/pdf',
      content: mockPdfBuffer,
    });
  });
});
