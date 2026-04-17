import { routing, type AppLocale } from "@/i18n/routing";

export const BASE_URL = "https://nangman.cloud";

export function getIntlLocale(locale: AppLocale): string {
  return locale === "ko" ? "ko-KR" : "en-US";
}

export function getOpenGraphLocale(locale: AppLocale): string {
  return locale === "ko" ? "ko_KR" : "en_US";
}

export function getLocalizedPath(locale: AppLocale, pathname: string): string {
  if (pathname === "/") {
    return `/${locale}`;
  }

  return `/${locale}${pathname}`;
}

export function getLocalizedUrl(locale: AppLocale, pathname: string): string {
  return `${BASE_URL}${getLocalizedPath(locale, pathname)}`;
}

export function getLanguageAlternates(pathname: string): Record<string, string> {
  const entries = routing.locales.map((locale) => [
    locale,
    getLocalizedUrl(locale, pathname),
  ]);

  return {
    ...Object.fromEntries(entries),
    "x-default": BASE_URL,
  };
}
