import { describe, expect, it } from "vitest";
import {
  getIntlLocale,
  getLanguageAlternates,
  getLocalizedPath,
  getLocalizedUrl,
  getOpenGraphLocale,
} from "@/lib/i18n";
import { BASE_URL } from "@/lib/site";

describe("lib/i18n", () => {
  it("returns the correct Intl locale", () => {
    expect(getIntlLocale("ko")).toBe("ko-KR");
    expect(getIntlLocale("en")).toBe("en-US");
  });

  it("returns the correct Open Graph locale", () => {
    expect(getOpenGraphLocale("ko")).toBe("ko_KR");
    expect(getOpenGraphLocale("en")).toBe("en_US");
  });

  it("builds localized paths", () => {
    expect(getLocalizedPath("ko", "/")).toBe("/ko");
    expect(getLocalizedPath("en", "/blog")).toBe("/en/blog");
  });

  it("builds localized absolute urls", () => {
    expect(getLocalizedUrl("ko", "/")).toBe(`${BASE_URL}/ko`);
    expect(getLocalizedUrl("en", "/services")).toBe(
      `${BASE_URL}/en/services`,
    );
  });

  it("builds hreflang alternates including x-default", () => {
    expect(getLanguageAlternates("/members")).toEqual({
      ko: `${BASE_URL}/ko/members`,
      en: `${BASE_URL}/en/members`,
      "x-default": `${BASE_URL}/ko/members`,
    });
  });
});
