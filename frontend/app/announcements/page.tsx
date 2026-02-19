"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, ChevronLeft, ChevronRight } from "lucide-react";
import type { Announcement, AnnouncementType } from "@/lib/domain/announcement";
import { getLatestAnnouncementsUseCase } from "@/lib/application/use-cases/announcements/get-latest-announcements";

const PAGE_SIZE = 10;

type NoticeFilter = "all" | AnnouncementType;

const FILTER_LABELS: Record<NoticeFilter, string> = {
  all: "전체",
  notice: "공지",
  update: "업데이트",
};

function typeBadgeClass(type: AnnouncementType): string {
  if (type === "notice") {
    return "border-primary/30 bg-primary/10 text-primary";
  }

  return "border-border/50 bg-background/40 text-muted-foreground";
}

function typeLabel(type: AnnouncementType): string {
  if (type === "notice") {
    return "공지";
  }

  return "업데이트";
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NoticeFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadAnnouncements() {
      const items = await getLatestAnnouncementsUseCase({});
      if (!isMounted) {
        return;
      }

      setAnnouncements(items);
      setIsLoading(false);
    }

    void loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAnnouncements = useMemo(() => {
    if (filter === "all") {
      return announcements;
    }

    return announcements.filter((item) => item.type === filter);
  }, [announcements, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / PAGE_SIZE));
  const pageIndex = Math.max(1, Math.min(page, totalPages));
  const start = (pageIndex - 1) * PAGE_SIZE;
  const pagedAnnouncements = filteredAnnouncements.slice(start, start + PAGE_SIZE);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="relative max-w-6xl mx-auto">
        <div className="space-y-8 md:space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">공지사항</h1>
            <p className="text-muted-foreground">
              운영 공지와 업데이트 소식을 확인하세요
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {(Object.keys(FILTER_LABELS) as NoticeFilter[]).map((type) => {
              const active = filter === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFilter(type);
                    setPage(1);
                  }}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground hover:bg-card/40"
                  }`}
                >
                  {FILTER_LABELS[type]}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-border/40 bg-card/20 p-8 text-center text-muted-foreground backdrop-blur-sm">
              공지사항을 불러오는 중입니다.
            </div>
          ) : pagedAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-border/40 bg-card/20 p-8 text-center text-muted-foreground backdrop-blur-sm">
              표시할 공지사항이 없습니다.
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {pagedAnnouncements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="gpu-accelerated-blur group relative overflow-hidden rounded-2xl border border-border/30 bg-card/20 p-5 md:p-6 backdrop-blur-sm transition-colors hover:border-primary/35"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-mono ${typeBadgeClass(
                          announcement.type,
                        )}`}
                      >
                        <BellRing className="h-3 w-3" />
                        {typeLabel(announcement.type)}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {announcement.date}
                      </span>
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold tracking-tight">
                      {announcement.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {announcement.content}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={pageIndex <= 1}
              className="inline-flex items-center gap-1 rounded-md border border-border/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/40 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </button>
            <span className="min-w-16 text-center text-sm text-muted-foreground font-mono">
              {pageIndex} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={pageIndex >= totalPages}
              className="inline-flex items-center gap-1 rounded-md border border-border/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/40 disabled:opacity-40"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
