"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal, CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getLatestBlogPosts, type BlogPost } from "@/data/blogPosts";

interface BlogListClientProps {
  posts: BlogPost[];
}

type SortOption = "latest" | "oldest" | "author";

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 8;

function parseDate(dateText: string): number {
  const timestamp = Date.parse(dateText);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDate(dateText: string): string {
  const timestamp = Date.parse(dateText);
  if (Number.isNaN(timestamp)) {
    return dateText;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [runtimePosts, setRuntimePosts] = useState<BlogPost[]>(posts);
  const [query, setQuery] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    document.title = "기술 블로그 | Nangman Infra";
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBlogPosts() {
      const latest = await getLatestBlogPosts(20);
      if (isMounted) {
        setRuntimePosts(latest);
      }
    }

    void loadBlogPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const authorOptions = useMemo(() => {
    return [...new Set(runtimePosts.map((post) => post.author))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "ko-KR"));
  }, [runtimePosts]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const baseFiltered = runtimePosts.filter((post) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.description.toLowerCase().includes(normalizedQuery) ||
        post.author.toLowerCase().includes(normalizedQuery);

      const matchesAuthor =
        selectedAuthor === "all" || post.author === selectedAuthor;

      return matchesQuery && matchesAuthor;
    });

    return baseFiltered.sort((a, b) => {
      if (sortOption === "latest") {
        return parseDate(b.date) - parseDate(a.date);
      }
      if (sortOption === "oldest") {
        return parseDate(a.date) - parseDate(b.date);
      }
      return a.author.localeCompare(b.author, "ko-KR");
    });
  }, [runtimePosts, query, selectedAuthor, sortOption]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold mb-4">Engineering Log</h1>
        <p className="text-muted-foreground">
          스캔하기 쉬운 목록으로 최근 기술 기록을 빠르게 탐색할 수 있습니다.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 md:p-5 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_auto] gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(INITIAL_VISIBLE_COUNT);
              }}
              placeholder="제목/설명/작성자로 검색"
              className="w-full h-10 rounded-lg border border-border/60 bg-background/60 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <select
            value={selectedAuthor}
            onChange={(event) => {
              setSelectedAuthor(event.target.value);
              setVisibleCount(INITIAL_VISIBLE_COUNT);
            }}
            className="h-10 rounded-lg border border-border/60 bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">전체 작성자</option>
            {authorOptions.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(event) => {
              setSortOption(event.target.value as SortOption);
              setVisibleCount(INITIAL_VISIBLE_COUNT);
            }}
            className="h-10 rounded-lg border border-border/60 bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="정렬"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="author">작성자순</option>
          </select>
        </div>

        <div className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          총 {filteredPosts.length}개 결과
        </div>
      </motion.section>

      <div className="space-y-4">
        {visiblePosts.length > 0 ? (
          visiblePosts.map((post, index) => {
            const href = post.link || post.url || "#";
            const isExternal = Boolean(post.link || post.url);

            return (
              <motion.article
                key={post.id || href || `${post.author}-${index}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.24) }}
                className="group rounded-2xl border border-border/50 bg-card/35 hover:bg-card/55 transition-colors"
              >
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="block p-5 md:p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-background/70 border border-border/60 text-muted-foreground">
                      {post.platform}
                    </span>
                  </div>

                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {post.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {post.authorImage && (
                      <Image
                        src={post.authorImage}
                        alt={post.author}
                        width={22}
                        height={22}
                        className="w-[22px] h-[22px] rounded-full object-cover border border-primary/20"
                      />
                    )}
                    <span className="text-foreground/90 font-medium">
                      {post.author}
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDate(post.date)}
                    </span>
                    {post.tags.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="line-clamp-1">
                          {post.tags.slice(0, 3).map((tag) => `#${tag}`).join(" ")}
                        </span>
                      </>
                    )}
                  </div>
                </a>
              </motion.article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card/30 p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              검색 조건에 맞는 글이 없습니다.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedAuthor("all");
                setSortOption("latest");
                setVisibleCount(INITIAL_VISIBLE_COUNT);
              }}
              className="text-sm font-medium text-primary"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-4 py-2 text-sm font-medium hover:bg-card/60 transition-colors"
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
}
