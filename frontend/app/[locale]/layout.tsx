import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import { getLanguageAlternates, getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import { siteSeo } from "@/content/seo";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

const SITE_URL = "https://nangman.cloud";
const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/opengraph-image`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return {
    title: {
      default: siteSeo.title,
      template: "%s | Nangman Infra",
    },
    description: siteSeo.description[resolvedLocale],
    keywords: siteSeo.keywords[resolvedLocale],
    authors: [{ name: "Nangman Infra Community" }],
    creator: siteSeo.creator,
    publisher: siteSeo.creator,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: getOpenGraphLocale(resolvedLocale),
      alternateLocale: routing.locales
        .filter((entry) => entry !== resolvedLocale)
        .map((entry) => getOpenGraphLocale(entry)),
      url: getLocalizedUrl(resolvedLocale, "/"),
      siteName: "Nangman Infra",
      title: siteSeo.title,
      description: siteSeo.openGraphDescription[resolvedLocale],
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
      title: siteSeo.title,
      description: siteSeo.openGraphDescription[resolvedLocale],
      images: [DEFAULT_OG_IMAGE_URL],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: getLocalizedUrl(resolvedLocale, "/"),
      languages: getLanguageAlternates("/"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const resolvedLocale = locale;

  return (
    <>
      <Script id="nangman-locale-lang" strategy="beforeInteractive">
        {`document.documentElement.lang = ${JSON.stringify(resolvedLocale)};`}
      </Script>
      <Script
        id="nangman-analytics"
        src="https://analytics.nangman.cloud/api/script.js"
        data-site-id="ab245b8e45ff"
        strategy="afterInteractive"
      />
      <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Header />
          <div className="pt-16 flex flex-col min-h-screen">
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </NextIntlClientProvider>
    </>
  );
}
