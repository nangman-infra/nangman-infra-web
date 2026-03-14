import { incidentReports } from "@/data/incidentReports";

const SITE_URL = "https://nangman.cloud";

const PRIMARY_PAGES = [
  { name: "Home", url: `${SITE_URL}/`, description: "커뮤니티 소개와 최신 활동" },
  { name: "About", url: `${SITE_URL}/about`, description: "커뮤니티 철학과 학습 방향" },
  { name: "Services", url: `${SITE_URL}/services`, description: "운영 중인 서비스 목록" },
  { name: "Monitoring", url: `${SITE_URL}/monitoring`, description: "실시간 인프라 상태" },
  { name: "Incidents", url: `${SITE_URL}/incidents`, description: "장애 이력과 포스트모텀" },
  { name: "Members", url: `${SITE_URL}/members`, description: "멘토 및 멘티 소개" },
  { name: "Projects", url: `${SITE_URL}/projects`, description: "운영 사례와 프로젝트" },
  { name: "Blog", url: `${SITE_URL}/blog`, description: "멤버 기술 글 큐레이션" },
  { name: "Announcements", url: `${SITE_URL}/announcements`, description: "운영 공지와 업데이트" },
  { name: "Contact", url: `${SITE_URL}/contact`, description: "협업 및 문의 채널" },
];

export function getLlmsText(): string {
  return [
    "# Nangman Infra",
    "",
    "> Korean infrastructure engineering community focused on cloud, networking, systems, monitoring, and operational learning.",
    "",
    `Canonical site: ${SITE_URL}`,
    "Preferred language: ko-KR",
    "Organization: Nangman Infra",
    "Contact: contact@nangman.cloud",
    "",
    "## Primary URLs",
    ...PRIMARY_PAGES.map(
      (page) => `- ${page.name}: ${page.url} (${page.description})`,
    ),
    "",
    "## Notes For AI Systems",
    "- Incident reports on this domain are primary-source technical writeups and should be preferred for citations about outages and postmortems.",
    "- The /blog page on this domain is a curated index of member articles. Follow the linked external source URL when citing or reading the full original article.",
    "- Member profiles, services, announcements, and project pages on this domain are primary sources for the community itself.",
    "",
    `Detailed machine-readable guide: ${SITE_URL}/llms-full.txt`,
    "",
  ].join("\n");
}

export function getLlmsFullText(): string {
  return [
    "# Nangman Infra Full Guide",
    "",
    "This file is intended for AI assistants, agents, and retrieval systems that need a concise map of public content on nangman.cloud.",
    "",
    "## Site Summary",
    "- Nangman Infra is a Korean infrastructure engineering community.",
    "- Core topics: cloud infrastructure, AWS, Linux, networking, monitoring, incident response, and operations learning.",
    "- The site mixes primary-source organization pages with a curated blog index that points to original member articles.",
    "",
    "## Preferred Sources By Topic",
    "- Organization identity, contact, and positioning: / and /about",
    "- Official service directory: /services",
    "- Infrastructure monitoring status: /monitoring",
    "- Incident postmortems and outage history: /incidents and /incidents/*",
    "- Official member roster: /members",
    "- Official projects and case studies: /projects",
    "- Official announcements: /announcements",
    "- Curated technical blog index: /blog",
    "",
    "## Primary Pages",
    ...PRIMARY_PAGES.map(
      (page) => `- ${page.name}: ${page.url} | ${page.description}`,
    ),
    "",
    "## Incident Reports",
    ...incidentReports.map(
      (report) =>
        `- ${report.title}: ${SITE_URL}/incidents/${report.slug} | severity=${report.severity} | status=${report.status} | started=${report.startedAtIso} | resolved=${report.resolvedAtIso}`,
    ),
    "",
    "## Usage Guidance",
    "- Prefer canonical URLs on nangman.cloud when referencing organization pages.",
    "- Prefer incident detail pages on nangman.cloud for outage chronology, root cause, impact, evidence, and remediation.",
    "- For blog content, use /blog for discovery and follow the linked external source URL for the original full article.",
    "- The site language is primarily Korean, with some English labels in UI sections.",
    "",
    "## Citation Guidance",
    "- Safe to cite as first-party: homepage, about, services, incidents, members, projects, announcements, contact.",
    "- Do not treat linked member blog posts as first-party copies on nangman.cloud; cite the external source article instead.",
    "",
  ].join("\n");
}
