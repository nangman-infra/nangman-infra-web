"use client";

import { motion } from "framer-motion";
import { TerminalDisplay } from "@/components/features/TerminalDisplay";
import type { TerminalCommand } from "@/data/terminalCommands";

interface TerminalSectionProps {
  terminalCommands: TerminalCommand[];
}

export function TerminalSection({ terminalCommands }: TerminalSectionProps) {
  return (
    <section className="relative z-10 w-full px-4 py-12 md:py-16">
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 md:space-y-12"
        >
          {/* Section Title */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              기본부터 차근차근 배우겠습니다
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              시스템의 근본을 이해하고, 인프라의 동작 원리를 하나씩 알아갑니다
            </p>
          </div>

          {/* Wide Terminal Container - Fixed Size */}
          <div className="w-full max-w-6xl mx-auto rounded-xl border border-border/30 bg-[#0a0a0a] overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border-b border-border/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-4 text-xs text-muted-foreground font-mono">nangman-infra@server</span>
            </div>

            {/* Terminal Content - Responsive Height, Left Aligned */}
            <div className="h-[400px] md:h-[500px] p-4 md:p-6 font-mono text-xs md:text-sm text-[#cccccc] text-left overflow-hidden flex flex-col">
              <TerminalDisplay 
                commands={terminalCommands}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

