import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nangman Infra | We Build the Invisible",
    short_name: "Nangman Infra",
    description:
      "현업 엔지니어와 멘티가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 커뮤니티",
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
