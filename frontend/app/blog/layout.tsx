import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기술 블로그",
  description: "문제 해결 과정과 기술적 깊이를 기록합니다. 트러블 슈팅 로그와 기술 아티클을 공유합니다.",
  openGraph: {
    title: "기술 블로그 | Nangman Infra",
    description: "문제 해결 과정과 기술적 깊이를 기록합니다. 트러블 슈팅 로그와 기술 아티클을 공유합니다.",
    url: "https://nangman.io/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

