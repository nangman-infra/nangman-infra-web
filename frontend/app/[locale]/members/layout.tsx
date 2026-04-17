import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { buildSeoPageMetadata } from "@/lib/page-metadata";

type PageLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

type MetadataProps = Readonly<{
  params: Promise<{ locale: AppLocale }>;
}>;

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;

  return buildSeoPageMetadata({
    locale,
    pathname: "/members",
    page: "members",
  });
}

export default function MembersLayout({ children }: PageLayoutProps) {
  return children;
}
