import { NotFoundException } from '@nestjs/common';
import { DownloadMemberPortfolioPdfUseCase } from './download-member-portfolio-pdf.use-case';
import { MemberReaderPort } from '../../domain/ports/member-reader.port';
import { MemberPortfolioRendererPort } from '../../domain/ports/member-portfolio-renderer.port';

describe('DownloadMemberPortfolioPdfUseCase', () => {
  const mockMemberReader: MemberReaderPort = {
    readAll: jest.fn(),
  };

  const mockPortfolioRenderer: MemberPortfolioRendererPort = {
    render: jest.fn(),
  };

  let useCase: DownloadMemberPortfolioPdfUseCase;

  beforeEach(() => {
    useCase = new DownloadMemberPortfolioPdfUseCase(
      mockMemberReader,
      mockPortfolioRenderer,
    );
    jest.clearAllMocks();
  });

  it('should return a PDF document for senior member', async () => {
    (mockMemberReader.readAll as jest.Mock).mockResolvedValue([
      {
        slug: 'seongwon',
        name: '이성원',
        role: 'Mentor',
        category: 'senior',
        links: {
          homepage: 'https://seongwon.org',
          resume: '/resumes/seongwon-resume.pdf',
        },
      },
    ]);
    const mockPdfBuffer = Buffer.from('portfolio-pdf');
    (mockPortfolioRenderer.render as jest.Mock).mockResolvedValue(
      mockPdfBuffer,
    );

    const result = await useCase.execute('seongwon');

    expect(mockPortfolioRenderer.render).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      fileName: 'seongwon-portfolio.pdf',
      contentType: 'application/pdf',
      content: mockPdfBuffer,
    });
  });

  it('should match senior member by homepage alias', async () => {
    (mockMemberReader.readAll as jest.Mock).mockResolvedValue([
      {
        slug: '이성원',
        name: '이성원',
        role: 'Mentor',
        category: 'senior',
        links: {
          homepage: 'https://seongwon.org',
          resume: '/resumes/seongwon-resume.pdf',
        },
      },
    ]);
    const mockPdfBuffer = Buffer.from('portfolio-pdf');
    (mockPortfolioRenderer.render as jest.Mock).mockResolvedValue(
      mockPdfBuffer,
    );

    const result = await useCase.execute('seongwon');

    expect(mockPortfolioRenderer.render).toHaveBeenCalledTimes(1);
    expect(result.fileName).toBe('seongwon-portfolio.pdf');
  });

  it('should generate ASCII-safe filename when identifier is Korean', async () => {
    (mockMemberReader.readAll as jest.Mock).mockResolvedValue([
      {
        slug: '이성원',
        name: '이성원',
        role: 'Mentor',
        category: 'senior',
        links: {
          homepage: 'https://seongwon.org',
          resume: '/resumes/seongwon-resume.pdf',
        },
      },
    ]);
    const mockPdfBuffer = Buffer.from('portfolio-pdf');
    (mockPortfolioRenderer.render as jest.Mock).mockResolvedValue(
      mockPdfBuffer,
    );

    const result = await useCase.execute('이성원');

    expect(mockPortfolioRenderer.render).toHaveBeenCalledTimes(1);
    expect(result.fileName).toBe('seongwon-portfolio.pdf');
  });

  it('should throw NotFoundException when member does not exist', async () => {
    (mockMemberReader.readAll as jest.Mock).mockResolvedValue([]);

    await expect(useCase.execute('missing-member')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPortfolioRenderer.render).not.toHaveBeenCalled();
  });

  it('should return a PDF document for mentee member', async () => {
    (mockMemberReader.readAll as jest.Mock).mockResolvedValue([
      {
        slug: 'donggeon',
        name: '임동건',
        role: 'Mentee',
        category: 'mentee',
      },
    ]);
    const mockPdfBuffer = Buffer.from('portfolio-pdf');
    (mockPortfolioRenderer.render as jest.Mock).mockResolvedValue(
      mockPdfBuffer,
    );

    const result = await useCase.execute('donggeon');

    expect(mockPortfolioRenderer.render).toHaveBeenCalledTimes(1);
    expect(result.fileName).toBe('donggeon-portfolio.pdf');
  });
});
