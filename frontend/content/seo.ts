import type { AppLocale } from "@/i18n/routing";

type LocaleValue<T> = Record<AppLocale, T>;

export const siteSeo = {
  title: "Nangman Infra | We Build the Invisible",
  creator: "Nangman Infra",
  keywords: {
    ko: [
      "인프라",
      "인프라 엔지니어",
      "클라우드",
      "AWS",
      "네트워크",
      "운영체제",
      "낭만 인프라",
      "Nangman Infra",
      "Infrastructure Engineering",
      "DevOps",
      "SRE",
      "모니터링",
      "기술 블로그",
    ],
    en: [
      "infrastructure",
      "infrastructure engineer",
      "cloud",
      "AWS",
      "networking",
      "operating systems",
      "Nangman Infra",
      "Infrastructure Engineering",
      "DevOps",
      "SRE",
      "monitoring",
      "technical blog",
    ],
  } satisfies LocaleValue<string[]>,
  description: {
    ko: "현업 엔지니어와 멘티가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 커뮤니티입니다. 보이지 않지만 모든 것의 기반을 만듭니다.",
    en: "A community where working engineers and mentees grow together through hands-on infrastructure practice. We build the invisible foundations behind reliable systems.",
  } satisfies LocaleValue<string>,
  openGraphDescription: {
    ko: "현업 엔지니어와 멘티가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 커뮤니티입니다.",
    en: "A community where engineers and mentees grow together through practical infrastructure work.",
  } satisfies LocaleValue<string>,
  organizationDescription: {
    ko: "현업 엔지니어와 멘티가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 커뮤니티",
    en: "An infrastructure engineering community focused on practical learning and shared growth.",
  } satisfies LocaleValue<string>,
  websiteDescription: {
    ko: "현업 엔지니어와 멘티가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 커뮤니티",
    en: "An infrastructure engineering community focused on practical learning and shared growth.",
  } satisfies LocaleValue<string>,
} as const;

export const pageSeo = {
  about: {
    title: {
      ko: "낭만 인프라 소개",
      en: "About Nangman Infra",
    },
    description: {
      ko: "차가운 서버실에서 가장 뜨거운 열정을 찾습니다. 보이지 않는 곳에서 세상의 연결을 지탱하는 낭만있는 엔지니어들의 방향과 여정을 소개합니다.",
      en: "Learn the philosophy, mission, and journey of Nangman Infra, an engineering community that supports the invisible foundations of connected systems.",
    },
  },
  announcements: {
    title: {
      ko: "공지사항",
      en: "Announcements",
    },
    description: {
      ko: "낭만 인프라의 운영 공지와 서비스 업데이트를 확인할 수 있습니다.",
      en: "Track operational notices and service updates from Nangman Infra.",
    },
  },
  blog: {
    title: {
      ko: "기술 블로그",
      en: "Engineering Blog",
    },
    description: {
      ko: "문제 해결 과정과 기술적 깊이를 기록합니다. 트러블슈팅 로그와 기술 아티클을 공유합니다.",
      en: "A curated list of technical writing, troubleshooting notes, and engineering insights from Nangman Infra members.",
    },
  },
  contact: {
    title: {
      ko: "문의하기",
      en: "Contact",
    },
    description: {
      ko: "프로젝트 협업, 채용, 기술 교류 등 언제든 환영합니다. 문의를 보내주시면 빠르게 답변드립니다.",
      en: "Reach out for collaboration, hiring, or technical exchange. We review every message carefully.",
    },
  },
  incidents: {
    title: {
      ko: "장애 이력 및 포스트모텀",
      en: "Incident Reports",
    },
    description: {
      ko: "운영 중 발생한 장애 이력과 포스트모텀 보고서를 확인합니다.",
      en: "Review outage history and postmortem reports from production operations.",
    },
  },
  members: {
    title: {
      ko: "함께하는 사람들",
      en: "Members",
    },
    description: {
      ko: "AWS, Equinix에서 근무하는 선배들과 함께 성장하며, 인프라의 근본을 탐구하는 멘토와 멘티를 소개합니다.",
      en: "Meet the mentors and mentees growing through infrastructure engineering, operations, and real-world systems work.",
    },
  },
  monitoring: {
    title: {
      ko: "인프라 모니터링",
      en: "Infrastructure Monitoring",
    },
    description: {
      ko: "실시간 인프라 모니터링 상태를 확인합니다. 서버, 서비스, 네트워크 상태를 한눈에 확인할 수 있습니다.",
      en: "Inspect the current infrastructure status across servers, services, and networks.",
    },
  },
  projects: {
    title: {
      ko: "프로젝트 및 사례",
      en: "Projects & Case Studies",
    },
    description: {
      ko: "실제 운영 중인 서비스와 아키텍처 설계 사례를 확인하세요.",
      en: "Explore services, systems, and case studies built and operated by the community.",
    },
  },
  services: {
    title: {
      ko: "서비스",
      en: "Services",
    },
    description: {
      ko: "낭만 인프라에서 운영하는 내부 서비스에 접근할 수 있습니다. 모니터링, 자동화, 보안, 인프라 등 다양한 서비스를 제공합니다.",
      en: "Browse the internal services operated by Nangman Infra across monitoring, automation, security, infrastructure, collaboration, and storage.",
    },
  },
} as const;
