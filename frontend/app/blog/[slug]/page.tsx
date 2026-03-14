import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  UserRound,
} from "lucide-react";
import { getPublicBlogPosts } from "@/lib/application/use-cases/blog/get-public-blog-posts";
import {
  getBlogPostInternalHref,
  getBlogPostSourceUrl,
  matchesBlogPostSlug,
} from "@/lib/blog";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

async function getBlogPostFromSlug(slug: string) {
  const posts = await getPublicBlogPosts(50);
  return posts.find((post) => matchesBlogPostSlug(post, slug)) ?? null;
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

export async function generateStaticParams() {
  const posts = await getPublicBlogPosts(50);

  return posts.map((post) => ({
    slug: post.slug ?? getBlogPostInternalHref(post).replace("/blog/", ""),
  }));
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostFromSlug(slug);

  if (!post) {
    return {
      title: "기술 블로그",
      alternates: {
        canonical: "/blog",
      },
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} | Nangman Infra`,
      description: post.description,
      url: `https://nangman.cloud/blog/${slug}`,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({
  params,
}: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostFromSlug(slug);

  if (!post) {
    notFound();
  }

  const sourceUrl = getBlogPostSourceUrl(post);
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `https://nangman.cloud/blog/${slug}`,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "ko-KR",
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Nangman Infra",
      url: "https://nangman.cloud",
    },
    isBasedOn: sourceUrl,
    mainEntityOfPage: `https://nangman.cloud/blog/${slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingSchema),
        }}
      />
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="relative max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              블로그 목록으로
            </Link>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
            >
              원문 보기
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <article className="rounded-2xl border border-border/40 bg-card/25 p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="rounded-full border border-border/50 bg-background/50 px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                {post.platform}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <UserRound className="w-3.5 h-3.5" />
                {post.author}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                {formatDate(post.date)}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {post.title}
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed mb-6">
              이 페이지는 멤버 외부 블로그 글을 위한 내부 요약 페이지입니다.
              전문과 정확한 원문 표현은 원문 링크에서 확인하는 것이 기준입니다.
            </p>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6 space-y-4">
              <h2 className="text-lg font-semibold">요약</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-7 whitespace-pre-wrap">
                {post.description}
              </p>
            </div>

            {post.tags.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                  태그
                </h2>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/40 bg-background/40 px-3 py-1 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                원문 읽기
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-md border border-border/50 px-4 py-2 text-sm text-muted-foreground hover:bg-card/40 hover:text-foreground transition-colors"
              >
                다른 글 보기
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
