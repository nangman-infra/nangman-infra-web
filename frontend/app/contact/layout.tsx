import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "프로젝트 협업, 채용, 기술 교류 등 언제든 환영합니다. 국립한밭대학교 N5동에서 만나요.",
  openGraph: {
    title: "Contact Us | Nangman Infra",
    description: "프로젝트 협업, 채용, 기술 교류 등 언제든 환영합니다. 국립한밭대학교 N5동에서 만나요.",
    url: "https://nangman.io/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

