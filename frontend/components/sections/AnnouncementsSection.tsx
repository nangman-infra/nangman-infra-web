"use client";

import { motion } from "framer-motion";
import type { Announcement } from "@/data/announcements";

interface AnnouncementsSectionProps {
  latestAnnouncements: Announcement[];
}

export function AnnouncementsSection({ latestAnnouncements }: AnnouncementsSectionProps) {
  return (
    <section className="relative z-10 w-full px-4 py-12 md:py-16">
      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 md:space-y-12"
        >
          {/* Section Title */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              공지사항
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              중요한 소식과 이벤트를 확인하세요
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-border/30"></div>
            
            {/* Announcements */}
            <div className="space-y-6 md:space-y-8">
              {latestAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-12 md:pl-20"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-2 md:left-6 top-2 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-background ${
                    announcement.type === "notice" 
                      ? "bg-blue-500"
                      : announcement.type === "event"
                      ? "bg-green-500"
                      : "bg-purple-500"
                  }`}></div>
                  
                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        announcement.type === "notice" 
                          ? "bg-blue-500/20 text-blue-400"
                          : announcement.type === "event"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {announcement.type === "notice" ? "공지" : announcement.type === "event" ? "이벤트" : "업데이트"}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{announcement.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {announcement.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

