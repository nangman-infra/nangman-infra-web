import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인프라 모니터링",
  description: "실시간 인프라 모니터링 상태를 확인합니다. 서버, 서비스, 네트워크 상태를 한눈에 확인할 수 있습니다.",
  openGraph: {
    title: "인프라 모니터링 | Nangman Infra",
    description: "실시간 인프라 모니터링 상태를 확인합니다. 서버, 서비스, 네트워크 상태를 한눈에 확인할 수 있습니다.",
    url: "https://nangman.cloud/monitoring",
  },
};

export default function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

