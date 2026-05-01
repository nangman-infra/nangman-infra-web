import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { pageSeo } from "@/content/seo";
import {
  getLanguageAlternates,
  getLocalizedUrl,
  getOpenGraphLocale,
} from "@/lib/i18n";
import {
  BASE_URL,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_TWITTER_IMAGE_URL,
  SITE_NAME,
} from "@/lib/site";

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
    metadataBase: new URL(BASE_URL),
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
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
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
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_TWITTER_IMAGE_URL],
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
