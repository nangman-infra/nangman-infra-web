// Blog posts data structure
export interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  slug: string;
  url?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "네트워크 엔지니어 6개월 회고",
    description:
      "Cisco 골드 파트너사에서 온프렘 네트워크 엔지니어로 6개월 동안 일하며 겪은 교육 과정, 프로젝트 경험, 성장 포인트를 정리한 회고입니다.",
    date: "2025. 06. 13",
    author: "Juno",
    tags: ["Network", "Career"],
    slug: "network-engineer-6-months-retrospective",
    url: "https://se-juno.tistory.com/18",
  },
  {
    id: "2",
    title: "Spanning-Tree Protocol와 Path Cost Type(short & long)",
    description:
      "스패닝 트리 프로토콜의 기본 개념과 함께, 실제 현업 네트워크 구성에서 마주친 STP Path Cost Type(short/long)의 차이와 설정 시 주의할 점을 정리한 글입니다.",
    date: "2025. 05. 31",
    author: "Juno",
    tags: ["Network", "L2", "STP"],
    slug: "stp-path-cost-type-short-long",
    url: "https://se-juno.tistory.com/17",
  },
  {
    id: "3",
    title: "CCNP ENASRI(300-410) - VRF",
    description:
      "CCNP ENASRI 트랙의 VRF 파트를 공부하며, VLAN과의 비교를 통해 라우팅 테이블 분리 개념을 직관적으로 이해할 수 있도록 정리한 학습 노트입니다.",
    date: "2025. 05. 25",
    author: "Juno",
    tags: ["Network", "L3", "VRF"],
    slug: "ccnp-enasri-vrf",
    url: "https://se-juno.tistory.com/16",
  },
  {
    id: "4",
    title: "CCNP ENASRI(300-410) - MPLS",
    description:
      "공공 사업 환경에서 IP-MPLS 장비를 다루기 위해 학습한 MPLS 기본 개념과 동작 원리를 CCNP ENASRI 교재를 기반으로 정리한 글입니다.",
    date: "2025. 05. 16",
    author: "Juno",
    tags: ["Network", "L3", "MPLS"],
    slug: "ccnp-enasri-mpls",
    url: "https://se-juno.tistory.com/15",
  },
  {
    id: "5",
    title: "Load Balancer 종류 소개",
    description:
      "OSI 7 Layer와 TCP/IP 모델을 기반으로, L4/L7에서 동작하는 다양한 로드 밸런서 유형과 웹 애플리케이션에서의 활용 방식을 정리한 개념 정리 글입니다.",
    date: "2025. 05. 01",
    author: "Juno",
    tags: ["Network", "L4", "LoadBalancer"],
    slug: "load-balancer-types",
    url: "https://se-juno.tistory.com/14",
  },
];

// Get latest blog posts
export function getLatestBlogPosts(count: number = 3): BlogPost[] {
  return blogPosts.slice(0, count);
}

