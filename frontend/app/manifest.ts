import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nangman Infra | We Build the Invisible",
    short_name: "Nangman Infra",
    description: "국립한밭대학교 인프라 엔지니어링 팀, 낭만 인프라 공식 홈페이지",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#fbbf24",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

