import type { Member } from "@/types/member";

export const members: Member[] = [
  {
    name: "이성원",
    role: "Associate Delivery Consultant, AWS ProServe SDT A2C",
    affiliation: "Amazon Web Services (AWS)",
    category: "senior",
    experience: "2025년 6월 ~ 재직중 • 5년+ 클라우드 및 인프라 경력",
    bio: "인프라를 좋아해서 집을 지어 IDC를 만드는 것이 꿈입니다. 정보통신공학과를 전공하고 모바일융합공학과에서 석사를 마친 후, 현재 AWS 클라우드 환경에서 제조업, 의료, 금융, 서비스, IoT 등 다양한 산업 분야의 고객들에게 AWS 인프라 환경을 구축하고 있습니다.",
    specialties: ["서버", "네트워크", "운영체제", "AWS 인프라", "클라우드 아키텍처"],
    achievements: [
      "9개 AWS 자격증 보유",
      "50+ 프로젝트 완료",
      "28명 멘토링",
    ],
    profileImage: "/profiles/seongwon.png",
    education: [
      {
        degree: "석사",
        major: "모바일융합공학과",
        university: "국립한밭대학교",
        period: "2019년 3월 ~ 2021년 2월",
        thesis: "ARM 64비트 마이크로 서버 기반 컨테이너 클러스터링 시스템 구현",
        lab: "무선통신소프트웨어(WISOFT) 연구실",
        description: "NRF 연구재단 프로젝트의 핵심 연구원으로 참여하여 인프라 구성을 전담했습니다. 특히 ARM 64비트 기반 마이크로 서버를 활용한 컨테이너 클러스터링 시스템을 직접 설계하고 구현하며, 분산 환경에서의 효율적인 리소스 관리와 고가용성 확보에 기여했습니다. 이 과정에서 실증 서버 및 물리 인프라 구축, 성능 최적화 등 실무 중심의 연구를 수행했습니다.",
        papers: [
          {
            title: "ARM 64비트 마이크로 서버 기반 컨테이너 클러스터링 시스템 구현",
            type: "석사학위논문",
            date: "2021",
            authors: "이성원",
          },
          {
            title: "Docker-Swarm을 사용한 컨테이너 기반 시스템 구성",
            type: "학술대회논문",
            date: "2019.12",
            authors: "이성원, 이창석, 박현주",
          },
        ],
      },
      {
        degree: "학사",
        major: "정보통신공학과",
        university: "국립한밭대학교",
        period: "2013년 3월 ~ 2019년 2월",
        thesis: "차량 접촉사고 긴급 알림 시스템",
        lab: "무선통신소프트웨어(WISOFT) 연구실",
        description: "컴퓨터 구조, 네트워크 등 전공 지식을 습득하고 2학년부터 연구실 활동을 병행했습니다. 특히 졸업 프로젝트로 IoT 센서와 통신 기술을 활용해 차량 접촉사고 발생 시 운전자에게 긴급 알림을 전송하는 시스템을 개발하며 실무적인 문제 해결 역량을 길렀습니다.",
        papers: [
          {
            title: "차량 접촉사고 긴급 알림 시스템",
            type: "학사졸업논문",
            date: "2018.12",
            authors: "이성원, 최형준, 박현진, 이건희, 김기범, 김윤태, 배민태, 유용세",
          },
          {
            title: "흡연권과 혐연권 간의 갈등 완화를 위한 흡연 부스 시스템",
            type: "학술대회논문",
            date: "2017.12",
            authors: "박찬열, 박민영, 복지송, 서유리, 이성원, 박현주",
          },
          {
            title: "IoT Platform을 이용한 해상안전 드론 시스템 자동화에 관한 연구",
            type: "학술대회논문",
            date: "2017.1",
            authors: "최선호, 김남준, 이성원, 이수빈, 이근혁, 서보민, 한상혁, 박현주",
          },
        ],
      },
    ],
    workExperience: [
      {
        company: "Amazon Web Services (AWS)",
        position: "Associate Delivery Consultant, AWS ProServe SDT A2C",
        period: "2025년 6월 ~ 재직중",
        description: [
          "AWS 글로벌 고객 클라우드 아키텍처 설계 및 컨설팅",
          "엔터프라이즈급 클라우드 솔루션 아키텍처 제안",
          "AWS Well-Architected Framework 기반 아키텍처 리뷰",
          "고객 요구사항 분석 및 최적화된 클라우드 솔루션 제공",
          "클라우드 마이그레이션 전략 수립 및 실행 지원",
        ],
      },
      {
        company: "메가존클라우드주식회사",
        position: "AWS Solution Architect",
        period: "2022년 11월 ~ 2025년 4월",
        description: [
          "서버리스 방식의 데이터 분석 인프라 구축",
          "3 Tier-Architecture 기반 인프라 설계",
          "의료정보 시스템 장기 보관 인프라 구축",
          "온프레미스 to AWS 마이그레이션 프로젝트 수행",
          "ECS Fargate 기반 서버리스 컨테이너 환경 구축",
          "Amazon MSK 기반의 타사 플랫폼 연동",
          "IoT 시스템 확장을 위한 클라우드 인프라 설계",
          "금융 서비스 AWS 환경으로 마이그레이션",
          "AWS Well-Architected 프로젝트 수행",
        ],
      },
      {
        company: "(주)웨이커",
        position: "IV-LAB / 인프라 매니저",
        period: "2021년 6월 ~ 2022년 8월",
        description: [
          "포스트모텀 도입: 장애 발생 후 사내 장애 레포트 공유 및 해결 방안, 비상연락망 체계 구축",
          "무중단 배포 구축: Jenkins 기반 CI와 ALB 연동하여 중단 배포에서 무중단 배포 환경으로 전환",
          "AWS 클라우드 기반 인프라 아키텍처 재설계: 베타서비스와 신규 서비스 인프라 분리 및 통합",
          "AWS 클라우드 비용 절감: X86→ARM 마이그레이션, Compute Optimizer 활용, RI/SP 적용",
          "CloudWatch 기반 장애 모니터링 시스템: Lambda와 Slack 연동 실시간 알람 시스템 구축",
        ],
      },
      {
        company: "(주)센트비(SENTBE)",
        position: "Dev/Ops 매니저",
        period: "2020년 3월 ~ 2020년 5월",
        description: [
          "FSDC 핀테크 인프라 구축환경 확인 및 분석",
          "금융기반 클라우드 인프라 환경 기본 환경분석",
          "금융망 어플라이언스 기본 구성 아키텍처 설계",
          "자금세탁방지(AML, Anti-Money Laundering) 시스템 오류 확인 및 리포트화",
        ],
      },
      {
        company: "다양한 기관",
        position: "기타 인프라 경력",
        period: "2013 ~ 2017",
        description: [
          "KT 산하 대전광역시 교육청 초/중/고 네트워크 전산 장비 교체 지원",
          "연세대학교 원주세브란스기독병원 통신 지원",
          "ATCIS 운용 정비병 (Army Tactical Command Information System)",
        ],
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect - Professional",
        issuer: "Amazon Web Services",
      },
      {
        name: "AWS Certified DevOps Engineer - Professional",
        issuer: "Amazon Web Services",
      },
      {
        name: "AWS Certified Security - Specialty",
        issuer: "Amazon Web Services",
      },
      {
        name: "AWS Certified Advanced Networking - Specialty",
        issuer: "Amazon Web Services",
      },
      {
        name: "AWS Certified Machine Learning - Specialty",
        issuer: "Amazon Web Services",
      },
      {
        name: "AWS Certified Database - Specialty",
        issuer: "Amazon Web Services",
      },
      {
        name: "AWS Certified Data Analytics - Specialty",
        issuer: "Amazon Web Services",
      },
      {
        name: "AWS Certified Solutions Architect - Associate",
        issuer: "Amazon Web Services",
      },
      {
        name: "AWS Certified SysOps Administrator - Associate",
        issuer: "Amazon Web Services",
      },
    ],
    projects: [
      {
        title: "대규모 제조업 클라우드 마이그레이션",
        description: "온프레미스 인프라를 AWS로 전면 마이그레이션하여 확장성과 비용 효율성 개선",
        technologies: ["AWS", "EC2", "RDS", "S3", "CloudFormation", "Terraform"],
        industry: "제조업",
      },
      {
        title: "의료 데이터 플랫폼 구축",
        description: "HIPAA 컴플라이언스를 준수하는 안전한 의료 데이터 처리 및 저장 인프라 설계",
        technologies: ["AWS", "VPC", "IAM", "KMS", "CloudWatch", "Lambda"],
        industry: "의료",
      },
      {
        title: "금융 서비스 고가용성 아키텍처",
        description: "99.99% 가용성을 보장하는 다중 리전 아키텍처 설계 및 재해 복구 전략 수립",
        technologies: ["AWS", "Multi-Region", "Route53", "ELB", "RDS Multi-AZ"],
        industry: "금융",
      },
      {
        title: "IoT 엣지 컴퓨팅 인프라",
        description: "수천 개의 IoT 디바이스에서 수집된 데이터를 실시간으로 처리하는 엣지-클라우드 하이브리드 아키텍처 구축",
        technologies: ["AWS IoT", "Greengrass", "Kinesis", "Lambda", "DynamoDB"],
        industry: "IoT",
      },
    ],
    technicalSkills: [
      {
        category: "클라우드 플랫폼",
        skills: ["AWS", "EC2", "S3", "RDS", "Lambda", "VPC", "CloudFormation", "Terraform"],
      },
      {
        category: "네트워크",
        skills: ["VPC 설계", "VPN", "Direct Connect", "Route53", "CloudFront", "ELB"],
      },
      {
        category: "운영체제",
        skills: ["Linux", "Ubuntu", "CentOS", "Amazon Linux"],
      },
      {
        category: "자동화 및 DevOps",
        skills: ["Terraform", "CloudFormation", "Ansible", "Jenkins", "GitLab CI/CD", "Docker", "Kubernetes"],
      },
      {
        category: "모니터링 및 로깅",
        skills: ["CloudWatch", "CloudTrail", "X-Ray", "Prometheus", "Grafana"],
      },
      {
        category: "보안",
        skills: ["IAM", "KMS", "Secrets Manager", "WAF", "Shield", "Security Hub"],
      },
    ],
    mentoring: {
      count: 28,
      description: "인프라 엔지니어링 및 클라우드 아키텍처 분야에서 28명의 후배들을 멘토링하며 실무 경험과 기술 지식을 공유하고 있습니다.",
    },
    links: {
      blog: "https://judo0179.tistory.com/",
      homepage: "https://seongwon.org/",
      resume: "/resumes/seongwon-resume.pdf", // PDF 파일 경로
    },
  },
  {
    name: "손준호",
    role: "에퀴닉스 데이터센터 엔지니어",
    category: "senior",
  },
  {
    name: "임동건",
    role: "3학년 컴퓨터공학과",
    affiliation: "국립한밭대학교",
    category: "student",
    bio: "클라우드 인프라와 DevOps에 관심을 가지고 있습니다. 학교에서 AWS, 네이버 클라우드, Docker, Kubernetes, CI/CD 등을 활용한 여러 프로젝트를 수행하며 클라우드 플랫폼 운영과 자동화 역량을 키워왔습니다. 앞으로 클라우드 엔지니어로서 효율적인 시스템 설계와 안정적인 서비스 운영에 기여하고 싶습니다.",
    specialties: ["클라우드", "Github", "AWS", "네이버클라우드", "Linux"],
    certifications: [
      {
        name: "NAVER Cloud Platform Certified Associate",
        issuer: "네이버 클라우드 플랫폼",
      },
      {
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
      },
      {
        name: "네이버 클라우드 플랫폼 실무 특강 수료",
        issuer: "네이버 클라우드 플랫폼",
      },
      {
        name: "KRAFTON Jungle 웹개발 집중 캠프 수료",
        issuer: "KRAFTON",
      },
      {
        name: "AWS 클라우드 실무 특강 수료",
        issuer: "Amazon Web Services",
      },
    ],
  },
  {
    name: "정택준",
    role: "3학년 컴퓨터공학과",
    affiliation: "국립한밭대학교",
    category: "student",
    bio: "클라우드 인프라와 네트워크 기술에 깊은 관심을 가지고 있습니다. AWS 및 네이버 클라우드 실무 특강을 통해 클라우드 환경에 대한 이해를 쌓았으며, 네트워크 프로그래밍과 시스템 아키텍처 설계에 열정을 가지고 있습니다. 연합학습 연구 프로젝트에서 Jetson Nano, Raspberry Pi 등 엣지 디바이스를 활용한 분산 시스템 구축 경험이 있습니다.",
    specialties: ["클라우드", "네트워크", "AWS", "네이버클라우드", "Linux"],
    achievements: [
      "AWS 클라우드 실무 특강 수료",
      "네이버 클라우드 플랫폼 실무 특강 수료",
      "연합학습 연구 프로젝트 참여",
    ],
    profileImage: "/profiles/taekjun.png",
  },
  {
    name: "태성우",
    role: "3학년 컴퓨터공학과",
    affiliation: "국립한밭대학교",
    category: "student",
    bio: "인프라의 매력을 찾아 모험을 떠나는 학부생입니다. 컴퓨터공학과에 재학중이며, 기초 CS 지식 습득을 위한 학업과 사이드 프로젝트를 진행중입니다. 안정적이고 효율적인 서버 인프라 환경을 구축해주는 엔지니어가 되고싶습니다.",
    specialties: ["AWS", "네트워크", "Linux"],
    achievements: [
      "AWS Certified Cloud Practitioner 보유",
      "학점 4.3",
    ],
    profileImage: "/profiles/seongwoo.png",
  },
  {
    name: "김주형",
    role: "2학년 모바일융합공학과",
    affiliation: "국립한밭대학교",
    category: "student",
    bio: "기업의 취약점 진단 관리자를 희망하고 있으며 더 나아가 인하우스 담당자까지 목표를 하고 있습니다. 리눅스와 c++언어 기반으로 공부하고 있고 구축된 서버의 외부접근, 내부 모니터링과 내부 패치 등을 직접 진행해 보면서 CERT 관리자로써의 역량을 키우는데 중점을 두고 있습니다.",
    specialties: ["리눅스", "C++", "CERT", "보안", "모니터링"],
  },
  {
    name: "정희훈",
    role: "2학년 모바일융합공학과",
    affiliation: "국립한밭대학교",
    category: "student",
    bio: "공공기관에서 온프렘과 클라우드 인프라를 모두 다룰 수 있는 엔지니어를 목표로 하고 있습니다. 리눅스 및 네트워크 기반 기술을 중심으로 공부하고 있고, 서버를 직접 구축해 보면서 인프라 구조를 논리적으로 이해하는 데 최선을 다하고 있습니다.",
    specialties: ["리눅스", "네트워크", "온프렘", "클라우드", "인프라"],
    achievements: [
      "온프렘과 클라우드 인프라를 모두 잘 다루는 하이브리드 엔지니어",
    ],
    profileImage: "/profiles/heehoon.png",
  },
];

