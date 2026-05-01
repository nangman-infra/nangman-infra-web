import { MetadataRoute } from "next";
import {
  BACKGROUND_COLOR,
  SITE_NAME,
  SITE_TITLE,
  THEME_COLOR,
} from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/ko",
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description:
      "An infrastructure engineering community where working engineers and mentees grow through practical systems work.",
    start_url: "/ko",
    display: "standalone",
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
