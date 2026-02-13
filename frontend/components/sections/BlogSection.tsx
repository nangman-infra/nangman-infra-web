"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, CalendarDays } from "lucide-react";
import type { BlogPost } from "@/data/blogPosts";

interface BlogSectionProps {
  latestPosts: BlogPost[];
}

function toHref(post: BlogPost): string {
  return post.link || post.url || "#";
}

function isExternalLink(post: BlogPost): boolean {
  return Boolean(post.link || post.url);
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

export function BlogSection({ latestPosts }: BlogSectionProps) {
  const sortedPosts = [...latestPosts].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
  const featuredPost = sortedPosts[0];
  const recentList = sortedPosts.slice(1, 4);

  return (
    <section className="relative z-10 w-full px-4 py-12 md:py-16">
      <div className="relative max-w-7xl mx-auto">
        <div className="space-y-8 md:space-y-12">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              기술 블로그
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              문제 해결 과정과 기술적 깊이를 기록합니다
            </p>
          </motion.div>

          {featuredPost ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5 md:gap-6">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="group relative rounded-2xl border border-primary/30 bg-card/30 p-6 md:p-8 backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent opacity-80" />
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] tracking-widest uppercase px-2 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                      Featured
                    </span>
                    <span className="text-[11px] tracking-wide px-2 py-1 rounded-full bg-background/60 border border-border/60 text-muted-foreground">
                      {featuredPost.platform}
                    </span>
                  </div>

                  {isExternalLink(featuredPost) ? (
                    <a
                      href={toHref(featuredPost)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <h3 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h3>
                    </a>
                  ) : (
                    <Link href={toHref(featuredPost)} className="block">
                      <h3 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h3>
                    </Link>
                  )}

                  <p className="text-sm md:text-base text-muted-foreground line-clamp-3">
                    {featuredPost.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      {featuredPost.authorImage && (
                        <Image
                          src={featuredPost.authorImage}
                          alt={featuredPost.author}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full object-cover border border-primary/20"
                        />
                      )}
                      <span className="text-sm text-foreground/90 font-medium">
                        {featuredPost.author}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(featuredPost.date)}
                      </span>
                    </div>
                    <a
                      href={toHref(featuredPost)}
                      target={isExternalLink(featuredPost) ? "_blank" : undefined}
                      rel={isExternalLink(featuredPost) ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                    >
                      아티클 읽기
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.article>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-border/40 bg-card/20 p-4 md:p-5 backdrop-blur-sm"
              >
                <h3 className="text-sm font-semibold tracking-wide text-muted-foreground mb-4">
                  최신 업데이트
                </h3>
                <div className="space-y-2">
                  {recentList.length > 0 ? (
                    recentList.map((post, index) => (
                      <a
                        key={post.id ?? post.link ?? `${post.author}-${index}`}
                        href={toHref(post)}
                        target={isExternalLink(post) ? "_blank" : undefined}
                        rel={isExternalLink(post) ? "noopener noreferrer" : undefined}
                        className="block rounded-xl border border-border/40 bg-background/30 px-4 py-3 hover:border-primary/30 hover:bg-background/50 transition-colors"
                      >
                        <p className="text-sm font-medium line-clamp-1 mb-1 group-hover:text-primary">
                          {post.title}
                        </p>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{post.author}</span>
                          <span>·</span>
                          <span>{formatDate(post.date)}</span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      추가 포스트가 준비되면 여기에 표시됩니다.
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-card/20 p-6 text-sm text-muted-foreground">
              아직 표시할 블로그 포스트가 없습니다.
            </div>
          )}

          {/* View All Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center pt-4"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all font-medium"
            >
              <BookOpen className="w-5 h-5" />
              <span>전체 블로그 보기</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
