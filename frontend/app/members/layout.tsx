import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "함께하는 사람들",
  description: "AWS, Equinix에서 근무하는 선배들과 함께 성장하며, 인프라의 근본을 탐구하는 학생들을 소개합니다.",
  openGraph: {
    title: "함께하는 사람들 | Nangman Infra",
    description: "AWS, Equinix에서 근무하는 선배들과 함께 성장하며, 인프라의 근본을 탐구하는 학생들을 소개합니다.",
    url: "https://nangman.io/members",
  },
};

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

