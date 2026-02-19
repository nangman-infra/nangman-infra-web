import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "프로젝트 협업, 채용, 기술 교류 등 언제든 환영합니다. 문의를 보내주시면 빠르게 답변드립니다.",
  openGraph: {
    title: "Contact Us | Nangman Infra",
    description:
      "프로젝트 협업, 채용, 기술 교류 등 언제든 환영합니다. 문의를 보내주시면 빠르게 답변드립니다.",
    url: "https://nangman.cloud/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
