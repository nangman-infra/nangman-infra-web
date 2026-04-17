"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Users } from "lucide-react";
import { useLocale } from "next-intl";
import {
  ANIMATION_DELAY_STATS_SECTION,
  ANIMATION_DURATION_MEDIUM,
} from "@/constants/members";

type StatsSectionProps = Readonly<{
  totalMembers: number;
  seniorsCount: number;
  menteesCount: number;
}>;

export function StatsSection({
  totalMembers,
  seniorsCount,
  menteesCount,
}: StatsSectionProps) {
  const locale = useLocale();
  const copy =
    locale === "ko"
      ? {
          total: "전체 멤버",
          seniors: "멘토",
          mentees: "멘티",
        }
      : {
          total: "Total Members",
          seniors: "Mentors",
          mentees: "Mentees",
        };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_DURATION_MEDIUM, delay: ANIMATION_DELAY_STATS_SECTION }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8"
    >
      <div className="gpu-accelerated-blur group relative p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
        <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
        <div className="text-3xl font-bold mb-1">{totalMembers}</div>
        <div className="text-sm text-muted-foreground">{copy.total}</div>
      </div>
      <div className="gpu-accelerated-blur group relative p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
        <Briefcase className="w-8 h-8 mx-auto mb-3 text-primary" />
        <div className="text-3xl font-bold mb-1">{seniorsCount}</div>
        <div className="text-sm text-muted-foreground">{copy.seniors}</div>
      </div>
      <div className="gpu-accelerated-blur group relative p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
        <GraduationCap className="w-8 h-8 mx-auto mb-3 text-primary" />
        <div className="text-3xl font-bold mb-1">{menteesCount}</div>
        <div className="text-sm text-muted-foreground">{copy.mentees}</div>
      </div>
    </motion.div>
  );
}
