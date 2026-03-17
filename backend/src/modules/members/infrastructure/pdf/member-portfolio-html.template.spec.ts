import { MemberProfile } from '../../domain/member-profile';
import { buildMemberPortfolioHtml } from './member-portfolio-html.template';

describe('buildMemberPortfolioHtml', () => {
  const richMember: MemberProfile = {
    slug: 'seongwon',
    name: '이성원',
    role: 'Associate Delivery Consultant, AWS ProServe SDT A2C',
    affiliation: 'Amazon Web Services',
    category: 'senior',
    experience: '2025년 6월 ~ 재직중 • 5년+ 클라우드 및 인프라 경력',
    bio: '인프라와 클라우드 아키텍처를 중심으로 다양한 산업군 프로젝트를 수행하고 있습니다.',
    specialties: ['AWS 인프라', '네트워크', '클라우드 아키텍처'],
    achievements: ['운영 안정화와 비용 최적화를 병행한 아키텍처 개선'],
    links: {
      homepage: 'https://seongwon.org/',
      blog: 'https://judo0179.tistory.com/',
    },
    workExperience: [
      {
        company: 'Amazon Web Services (AWS)',
        position: 'Associate Delivery Consultant',
        period: '2025년 6월 ~ 재직중',
        description: ['AWS 글로벌 고객 클라우드 아키텍처 설계 및 컨설팅'],
      },
      {
        company: '메가존클라우드주식회사',
        position: 'AWS Solution Architect',
        period: '2022년 11월 ~ 2025년 4월',
        description: ['서버리스 방식의 데이터 분석 인프라 구축'],
      },
      {
        company: '(주)웨이커',
        position: 'IV-LAB / 인프라 매니저',
        period: '2021년 6월 ~ 2022년 8월',
        description: ['무중단 배포 구축'],
      },
      {
        company: '(주)센트비(SENTBE)',
        position: 'Dev/Ops 매니저',
        period: '2020년 3월 ~ 2020년 5월',
        description: ['금융기반 클라우드 인프라 환경 기본 환경분석'],
      },
    ],
    projects: [
      {
        title: '대규모 제조업 클라우드 마이그레이션',
        description: '온프레미스 인프라를 AWS로 전면 마이그레이션',
        technologies: ['AWS', 'EC2', 'Terraform'],
        industry: '제조업',
      },
      {
        title: '의료 데이터 플랫폼 구축',
        description: '의료 데이터 처리 및 저장 인프라 설계',
        technologies: ['AWS', 'IAM', 'KMS'],
        industry: '의료',
      },
      {
        title: '금융 서비스 고가용성 아키텍처',
        description: '다중 리전 아키텍처 설계',
        technologies: ['AWS', 'Route53'],
        industry: '금융',
      },
      {
        title: 'IoT 엣지 컴퓨팅 인프라',
        description: '엣지-클라우드 하이브리드 아키텍처 구축',
        technologies: ['AWS IoT', 'Greengrass'],
        industry: 'IoT',
      },
    ],
    technicalSkills: [
      {
        category: '클라우드 플랫폼',
        skills: ['AWS', 'EC2', 'RDS'],
      },
      {
        category: '네트워크',
        skills: ['VPC', 'Direct Connect'],
      },
      {
        category: '자동화 및 DevOps',
        skills: ['Terraform', 'Jenkins'],
      },
      {
        category: '보안',
        skills: ['IAM', 'KMS'],
      },
      {
        category: '모니터링',
        skills: ['CloudWatch', 'Grafana'],
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect - Professional',
        issuer: 'Amazon Web Services',
      },
      {
        name: 'AWS Certified DevOps Engineer - Professional',
        issuer: 'Amazon Web Services',
      },
      {
        name: 'AWS Certified Security - Specialty',
        issuer: 'Amazon Web Services',
      },
      {
        name: 'AWS Certified Advanced Networking - Specialty',
        issuer: 'Amazon Web Services',
      },
      {
        name: 'AWS Certified Database - Specialty',
        issuer: 'Amazon Web Services',
      },
      {
        name: 'AWS Certified Data Analytics - Specialty',
        issuer: 'Amazon Web Services',
      },
    ],
    education: [
      {
        degree: '석사',
        major: '모바일융합공학과',
        university: '국립한밭대학교',
        period: '2019년 3월 ~ 2021년 2월',
        description: 'ARM 기반 컨테이너 클러스터링 시스템을 연구했습니다.',
        papers: [
          {
            title: 'ARM 기반 컨테이너 클러스터링 시스템',
            type: '석사학위논문',
            date: '2021',
          },
        ],
      },
      {
        degree: '학사',
        major: '정보통신공학과',
        university: '국립한밭대학교',
        period: '2013년 3월 ~ 2019년 2월',
      },
    ],
  };

  it('renders all portfolio items without truncating rich member data', () => {
    const html = buildMemberPortfolioHtml({ member: richMember });

    expect(html).toContain('(주)센트비(SENTBE)');
    expect(html).toContain('IoT 엣지 컴퓨팅 인프라');
    expect(html).toContain('AWS Certified Data Analytics - Specialty');
    expect(html).toContain('학사 · 정보통신공학과');
    expect(html).toContain('Technical Skills');
  });

  it('omits empty sections for sparse members', () => {
    const html = buildMemberPortfolioHtml({
      member: {
        slug: 'donggeon',
        name: '임동건',
        role: '3학년 컴퓨터공학과',
        affiliation: '국립한밭대학교',
        category: 'mentee',
        bio: '클라우드 인프라와 DevOps에 관심이 있습니다.',
        certifications: [
          {
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
          },
        ],
      },
    });

    expect(html).not.toContain('Work Experience');
    expect(html).not.toContain('Selected Projects');
    expect(html).not.toContain('Core Areas');
    expect(html).toContain('Certifications');
    expect(html).toContain('AWS Certified Cloud Practitioner');
  });

  it('escapes unsafe content before injecting into the document', () => {
    const html = buildMemberPortfolioHtml({
      member: {
        ...richMember,
        bio: '<script>alert("xss")</script>',
      },
    });

    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert("xss")</script>');
  });
});
