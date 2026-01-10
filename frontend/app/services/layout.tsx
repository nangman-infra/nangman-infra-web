import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스",
  description: "낭만 인프라에서 운영하는 내부 서비스에 접근할 수 있습니다. 모니터링, 자동화, 보안, 인프라 등 다양한 서비스를 제공합니다.",
  openGraph: {
    title: "서비스 | Nangman Infra",
    description: "낭만 인프라에서 운영하는 내부 서비스에 접근할 수 있습니다.",
    url: "https://nangman.cloud/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
