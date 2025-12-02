"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/data/blogPosts";

interface BlogSectionProps {
  latestPosts: BlogPost[];
}

export function BlogSection({ latestPosts }: BlogSectionProps) {
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

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {latestPosts.map((post: BlogPost, index: number) => {
              const href = post.url ?? `/blog/${post.slug}`;
              const isExternal = Boolean(post.url);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="gpu-accelerated-blur group relative p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                    <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                      {post.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs font-mono text-primary px-2 py-0.5 rounded-md bg-background/40 border border-primary/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    {isExternal ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <h3 className="text-xl font-semibold mb-3 relative z-10 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </a>
                    ) : (
                      <Link href={href}>
                        <h3 className="text-xl font-semibold mb-3 relative z-10 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                    )}

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 relative z-10">
                      {post.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground relative z-10">
                      <div className="flex items-center gap-3">
                        <span>{post.date}</span>
                        <span>·</span>
                        <span>By {post.author}</span>
                      </div>
                      {isExternal ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:gap-2 transition-all"
                        >
                          <span>읽기</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="flex items-center gap-1 text-primary hover:gap-2 transition-all"
                        >
                          <span>읽기</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

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

