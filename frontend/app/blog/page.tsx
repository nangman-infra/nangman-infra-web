import { getBlogPostSourceUrl } from "@/lib/blog";
import { getPublicBlogPosts } from "@/lib/application/use-cases/blog/get-public-blog-posts";
import BlogListClient from "./BlogListClient";

export default async function BlogPage() {
  const posts = await getPublicBlogPosts(20);

  const blogCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Nangman Infra 기술 블로그",
    url: "https://nangman.cloud/blog",
    description:
      "낭만 인프라 멤버들의 기술 글과 트러블슈팅 기록을 모아보는 블로그 목록 페이지입니다.",
    inLanguage: "ko-KR",
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
