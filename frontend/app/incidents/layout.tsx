import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incident Reports",
  description:
    "운영 중 발생한 장애 이력과 포스트모텀 보고서를 확인합니다.",
  openGraph: {
    title: "Incident Reports | Nangman Infra",
    description:
      "운영 중 발생한 장애 이력과 포스트모텀 보고서를 확인합니다.",
    url: "https://nangman.cloud/incidents",
  },
};

export default function IncidentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
