import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { pageSeo } from "@/content/seo";
import {
  getLanguageAlternates,
  getLocalizedUrl,
  getOpenGraphLocale,
} from "@/lib/i18n";

const SITE_URL = "https://nangman.cloud";
const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/opengraph-image`;

type BuildPageMetadataOptions = Readonly<{
  locale: AppLocale;
  pathname: string;
  title: string;
  description: string;
  openGraphType?: "website" | "article";
}>;

export type SeoPageKey = keyof typeof pageSeo;

export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
  openGraphType = "website",
}: BuildPageMetadataOptions): Metadata {
  const url = getLocalizedUrl(locale, pathname);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: url,
      languages: getLanguageAlternates(pathname),
    },
    openGraph: {
      type: openGraphType,
      locale: getOpenGraphLocale(locale),
      url,
      siteName: "Nangman Infra",
      title: `${title} | Nangman Infra`,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "Nangman Infra",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Nangman Infra`,
      description,
      images: [DEFAULT_OG_IMAGE_URL],
    },
  };
}

type BuildSeoPageMetadataOptions = Readonly<{
  locale: AppLocale;
  pathname: string;
  page: SeoPageKey;
  openGraphType?: "website" | "article";
}>;

export function buildSeoPageMetadata({
  locale,
  pathname,
  page,
  openGraphType,
}: BuildSeoPageMetadataOptions): Metadata {
  const pageContent = pageSeo[page];

  return buildPageMetadata({
    locale,
    pathname,
    title: pageContent.title[locale],
    description: pageContent.description[locale],
    openGraphType,
  });
}
