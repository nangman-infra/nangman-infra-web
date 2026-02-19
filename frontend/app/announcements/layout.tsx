import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항",
  description:
    "낭만 인프라의 운영 공지와 서비스 업데이트를 확인할 수 있습니다.",
  openGraph: {
    title: "공지사항 | Nangman Infra",
    description:
      "낭만 인프라의 운영 공지와 서비스 업데이트를 확인할 수 있습니다.",
    url: "https://nangman.cloud/announcements",
  },
};

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
