import { ResolveMemberPortfolioTargetUseCase } from './resolve-member-portfolio-target.use-case';
import { MemberNotFoundError } from '../../domain/errors/member-portfolio.error';
import { MemberReaderPort } from '../../domain/ports/member-reader.port';

describe('ResolveMemberPortfolioTargetUseCase', () => {
  const mockMemberReader: MemberReaderPort = {
    readAll: jest.fn(),
  };

  let useCase: ResolveMemberPortfolioTargetUseCase;

  beforeEach(() => {
    useCase = new ResolveMemberPortfolioTargetUseCase(mockMemberReader);
    jest.clearAllMocks();
  });

  it('should resolve member by slug and generate safe filename', async () => {
    (mockMemberReader.readAll as jest.Mock).mockResolvedValue([
      {
        slug: 'seongwon',
        name: '이성원',
        role: 'Mentor',
        category: 'senior',
      },
    ]);

    const target = await useCase.execute('seongwon');

    expect(target.member.slug).toBe('seongwon');
    expect(target.fileName).toBe('seongwon-portfolio.pdf');
    expect(target.cacheKey.startsWith('seongwon:')).toBe(true);
  });

  it('should resolve member by homepage alias', async () => {
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

    const target = await useCase.execute('seongwon');

    expect(target.fileName).toBe('seongwon-portfolio.pdf');
  });

  it('should fall back to ASCII alias when identifier is Korean', async () => {
    (mockMemberReader.readAll as jest.Mock).mockResolvedValue([
      {
        slug: '이성원',
        name: '이성원',
        role: 'Mentor',
        category: 'senior',
        links: {
          homepage: 'https://seongwon.org',
        },
      },
    ]);

    const target = await useCase.execute('이성원');

    expect(target.fileName).toBe('seongwon-portfolio.pdf');
  });

  it('should resolve mentee member', async () => {
    (mockMemberReader.readAll as jest.Mock).mockResolvedValue([
      {
        slug: 'donggeon',
        name: '임동건',
        role: 'Mentee',
        category: 'mentee',
      },
    ]);

    const target = await useCase.execute('donggeon');

    expect(target.fileName).toBe('donggeon-portfolio.pdf');
  });

  it('should throw not found when member does not exist', async () => {
    (mockMemberReader.readAll as jest.Mock).mockResolvedValue([]);

    await expect(useCase.execute('missing-member')).rejects.toThrow(
      MemberNotFoundError,
    );
  });
});
