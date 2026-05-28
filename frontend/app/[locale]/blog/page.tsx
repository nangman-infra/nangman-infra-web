import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { getBlogPostSourceUrl } from "@/lib/blog";
import { getBlogPostsPageUseCase } from "@/lib/application/use-cases/blog/get-blog-posts-page";
import { getFallbackBlogPosts } from "@/data/blogPosts";
import { getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import BlogListClient from "./BlogListClient";

export const dynamic = "force-dynamic";

const INITIAL_PAGE_SIZE = 20;
const BLOG_PAGE_REVALIDATE_SECONDS = 300;

type BlogPageProps = Readonly<{
  params: Promise<{ locale: AppLocale }>;
}>;

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  const initialPage = await getBlogPostsPageUseCase({
    page: 1,
    pageSize: INITIAL_PAGE_SIZE,
    fallback: getFallbackBlogPosts(INITIAL_PAGE_SIZE),
    revalidateSeconds: BLOG_PAGE_REVALIDATE_SECONDS,
  });

  const blogCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("schemaName"),
    url: getLocalizedUrl(locale, "/blog"),
    description: t("schemaDescription"),
    inLanguage: getOpenGraphLocale(locale).replace("_", "-"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: initialPage.posts.map((post, index) => ({
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
      <BlogListClient
        initialPage={{
          posts: initialPage.posts,
          total: initialPage.total,
          page: initialPage.page,
          pageSize: initialPage.pageSize,
          totalPages: initialPage.totalPages,
        }}
      />
    </>
  );
}
