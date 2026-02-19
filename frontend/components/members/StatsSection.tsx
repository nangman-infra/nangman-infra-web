"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Users } from "lucide-react";
import {
  ANIMATION_DELAY_STATS_SECTION,
  ANIMATION_DURATION_MEDIUM,
} from "@/constants/members";

interface StatsSectionProps {
  totalMembers: number;
  seniorsCount: number;
  menteesCount: number;
}

export function StatsSection({
  totalMembers,
  seniorsCount,
  menteesCount,
}: StatsSectionProps) {
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
        <div className="text-sm text-muted-foreground">전체 멤버</div>
      </div>
      <div className="gpu-accelerated-blur group relative p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
        <Briefcase className="w-8 h-8 mx-auto mb-3 text-primary" />
        <div className="text-3xl font-bold mb-1">{seniorsCount}</div>
        <div className="text-sm text-muted-foreground">멘토</div>
      </div>
      <div className="gpu-accelerated-blur group relative p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
        <GraduationCap className="w-8 h-8 mx-auto mb-3 text-primary" />
        <div className="text-3xl font-bold mb-1">{menteesCount}</div>
        <div className="text-sm text-muted-foreground">멘티</div>
      </div>
    </motion.div>
  );
}
