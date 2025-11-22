// Blog posts data structure
export interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "AWS EKS 환경에서의 오토스케일링 최적화 여정",
    description: "트래픽 스파이크 발생 시 Pod 초기화 지연 문제를 해결하기 위해 Karpenter를 도입하고 Warm Pool을 구성했던 경험을 공유합니다.",
    date: "2025. 03. 15",
    author: "Sungwon",
    tags: ["Kubernetes", "Troubleshooting"],
    slug: "eks-autoscaling-optimization",
  },
  {
    id: "2",
    title: "Docker 컨테이너 메모리 누수 디버깅",
    description: "프로덕션 환경에서 발생한 컨테이너 메모리 누수 문제를 해결하기 위한 과정과 도구 사용법을 정리했습니다.",
    date: "2025. 03. 10",
    author: "Sungwon",
    tags: ["Docker", "Troubleshooting"],
    slug: "docker-memory-leak-debugging",
  },
  {
    id: "3",
    title: "Terraform으로 인프라 코드화하기",
    description: "기존 수동 인프라를 Terraform으로 마이그레이션하며 겪은 문제들과 해결 방법을 공유합니다.",
    date: "2025. 03. 05",
    author: "Sungwon",
    tags: ["Terraform", "IaC"],
    slug: "terraform-infrastructure-as-code",
  },
];

// Get latest blog posts
export function getLatestBlogPosts(count: number = 3): BlogPost[] {
  return blogPosts.slice(0, count);
}

