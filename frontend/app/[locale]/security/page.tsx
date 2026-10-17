import type { AppLocale } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SecurityPage } from "@/components/security/SecurityPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    pathname: "/security",
    title: locale === "ko" ? "보안 현황" : "Security",
    description: locale === "ko"
      ? "낭만 인프라의 실시간 침입 탐지와 방화벽 차단 현황을 확인하세요."
      : "Live intrusion detection and firewall protection at Nangman Infra.",
  });
}

export default function Page() {
  return <SecurityPage />;
}
