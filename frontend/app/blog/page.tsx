"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { blogPosts } from "@/data/blogPosts";

export default function BlogPage() {
  useEffect(() => {
    document.title = "기술 블로그 | Nangman Infra";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Engineering Log</h1>
        <p className="text-muted-foreground">
          트러블 슈팅 경험과 기술적인 인사이트를 공유합니다.
        </p>
      </motion.div>

      <div className="space-y-8">
        {blogPosts.map((post, index) => {
          const href = post.url ?? "https://se-juno.tistory.com/";
          const isExternal = Boolean(post.url);

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 1) * 0.1 }}
              className="group flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors cursor-pointer touch-manipulation"
            >
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="flex-1"
              >
                <div className="flex flex-wrap gap-2 mb-3 text-xs font-mono text-primary">
                  {post.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>By {post.author}</span>
                </div>
              </a>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

