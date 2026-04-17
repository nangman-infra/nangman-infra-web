import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { getBlogPostSourceUrl } from "@/lib/blog";
import { getPublicBlogPosts } from "@/lib/application/use-cases/blog/get-public-blog-posts";
import { getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import BlogListClient from "./BlogListClient";

export const dynamic = "force-dynamic";

type BlogPageProps = Readonly<{
  params: Promise<{ locale: AppLocale }>;
}>;

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  const posts = await getPublicBlogPosts(20);

  const blogCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("schemaName"),
    url: getLocalizedUrl(locale, "/blog"),
    description: t("schemaDescription"),
    inLanguage: getOpenGraphLocale(locale).replace("_", "-"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getBlogPostSourceUrl(post),
        name: post.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogCollectionSchema),
        }}
      />
      <BlogListClient posts={posts} />
    </>
  );
}
