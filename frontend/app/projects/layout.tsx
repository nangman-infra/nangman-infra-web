import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects & Case Studies",
  description: "실제 운영 중인 서비스와 아키텍처 설계 사례를 확인하세요. Netlab, Lunar, Papyrus 등 다양한 프로젝트를 소개합니다.",
  openGraph: {
    title: "Projects & Case Studies | Nangman Infra",
    description: "실제 운영 중인 서비스와 아키텍처 설계 사례를 확인하세요. Netlab, Lunar, Papyrus 등 다양한 프로젝트를 소개합니다.",
    url: "https://nangman.io/projects",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

