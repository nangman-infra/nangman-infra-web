import { describe, expect, it } from "vitest";
import { buildPageMetadata, buildSeoPageMetadata } from "@/lib/page-metadata";

describe("page metadata helpers", () => {
  it("builds localized metadata with canonical and language alternates", () => {
    const metadata = buildPageMetadata({
      locale: "en",
      pathname: "/services",
      title: "Services",
      description: "Browse internal services",
    });

    expect(metadata.metadataBase?.toString()).toBe("https://nangman.cloud/");
    expect(metadata.alternates?.canonical).toBe("https://nangman.cloud/en/services");
    expect(metadata.alternates?.languages).toEqual({
      ko: "https://nangman.cloud/ko/services",
      en: "https://nangman.cloud/en/services",
      "x-default": "https://nangman.cloud/ko/services",
    });
    expect(metadata.openGraph?.locale).toBe("en_US");
    expect(metadata.openGraph?.title).toBe("Services | Nangman Infra");
    expect(metadata.twitter?.title).toBe("Services | Nangman Infra");
  });

  it("builds SEO metadata from configured page content", () => {
    const metadata = buildSeoPageMetadata({
      locale: "ko",
      pathname: "/about",
      page: "about",
    });

    expect(metadata.title).toBe("낭만 인프라 소개");
    expect(metadata.description).toBe(
      "차가운 서버실에서 가장 뜨거운 열정을 찾습니다. 보이지 않는 곳에서 세상의 연결을 지탱하는 낭만있는 엔지니어들의 방향과 여정을 소개합니다.",
    );
    expect(metadata.openGraph?.locale).toBe("ko_KR");
    expect(metadata.alternates?.canonical).toBe("https://nangman.cloud/ko/about");
  });
});
