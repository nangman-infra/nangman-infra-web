import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nangman Infra | We Build the Invisible",
    short_name: "Nangman Infra",
    description:
      "An infrastructure engineering community where working engineers and mentees grow through practical systems work.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#fbbf24",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
