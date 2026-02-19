"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BellRing } from "lucide-react";
import type { Announcement } from "@/lib/domain/announcement";

interface AnnouncementsSectionProps {
  latestAnnouncements: Announcement[];
}

function typeBadgeClass(type: Announcement["type"]): string {
  if (type === "notice") {
    return "border-primary/30 bg-primary/10 text-primary";
  }

  return "border-border/50 bg-background/40 text-muted-foreground";
}

function typeLabel(type: Announcement["type"]): string {
  if (type === "notice") {
    return "공지";
  }

  return "업데이트";
}

export function AnnouncementsSection({ latestAnnouncements }: AnnouncementsSectionProps) {
  return (
    <section className="relative z-10 w-full px-4 py-12 md:py-16">
      <div className="relative max-w-6xl mx-auto">
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
              공지사항
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              운영 소식과 업데이트를 확인하세요
            </p>
          </motion.div>

          {latestAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-border/40 bg-card/20 p-6 text-center text-muted-foreground backdrop-blur-sm">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {latestAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="gpu-accelerated-blur group relative overflow-hidden rounded-2xl border border-border/30 bg-card/20 p-5 md:p-6 backdrop-blur-sm transition-colors hover:border-primary/35"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-mono ${typeBadgeClass(announcement.type)}`}
                      >
                        <BellRing className="h-3 w-3" />
                        {typeLabel(announcement.type)}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{announcement.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {announcement.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <Link
              href="/announcements"
              className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              전체 공지 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
