import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|icon(?:$|/)|apple-icon(?:$|/)|opengraph-image(?:$|/)|twitter-image(?:$|/)|.*\\..*).*)",
  ],
};
