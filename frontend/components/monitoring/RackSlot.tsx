"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import type { MonitorStatus } from "@/lib/api";
import { getSmartName } from "@/components/monitoring/utils";

interface RackSlotProps {
  size: number;
  monitor: MonitorStatus | null;
}

const RACK_SLOT_HEIGHT_PER_U = 24;

/**
 * 랙 슬롯 컴포넌트
 * 가이드라인: 단일 책임 원칙에 따라 랙 슬롯 렌더링만 담당
 */
export const RackSlot = memo<RackSlotProps>(({ size, monitor }) => {
  const height = size * RACK_SLOT_HEIGHT_PER_U;
  const [isHovered, setIsHovered] = useState(false);

  if (!monitor) {
    return (
      <div
        style={{ height: `${height}px` }}
        className="flex items-center px-6 border-b border-white/5 relative group bg-[#080809]/50"
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #333 0, #333 1px, transparent 0, transparent 2px)",
            backgroundSize: "100% 2px",
          }}
        />
        <span className="text-[8px] font-bold text-white/5 font-mono tracking-[0.4em] z-10 uppercase text-center w-full">
          BLANK PANEL
        </span>
      </div>
    );
  }

  const isUp = monitor.status === "up";
  const isDown = monitor.status === "down";
  const smartName = getSmartName(monitor.name);

  return (
    <div
      style={{ height: `${height}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex flex-col justify-center px-6 border-b border-white/15 relative group cursor-pointer transition-all duration-300 
        ${isDown ? "bg-red-500/10" : "bg-[#121214] hover:bg-[#1a1a1c]"} 
        ${isUp ? "shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]" : ""}`}
    >
      <div className="absolute inset-0 bg-linear-to-b from-white/2 to-transparent pointer-events-none" />

      <div className="relative grid grid-cols-[1fr_auto] items-center gap-4 z-10 w-full overflow-hidden">
        <div className="flex items-center gap-4 min-w-0 overflow-hidden">
          {/* Hardware LED Bank with Pulse Animation */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <motion.div
              animate={isUp ? { opacity: [1, 0.6, 1], scale: [1, 1.1, 1] } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                type: "tween",
              }}
              style={{ willChange: "transform, opacity" }}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                isUp
                  ? "bg-[#00ff00] shadow-[0_0_12px_rgba(0,255,0,0.8)]"
                  : isDown
                    ? "bg-[#ff0000] shadow-[0_0_12px_rgba(255,0,0,0.8)]"
                    : "bg-[#ffff00]"
              }`}
            />
            <div
              className={`w-2 h-1 rounded-sm ${isUp ? "bg-[#00ff00]/20" : "bg-white/5"}`}
            />
          </div>

          <div className="flex flex-col min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-1 shrink-0">
              <span
                className={`text-[10px] font-black font-mono tracking-widest ${isUp ? "text-primary" : "text-white/40"}`}
              >
                {isUp ? "ONLINE" : isDown ? "OFFLINE" : "PENDING"}
              </span>
              <span className="text-[8px] text-white/20 font-mono uppercase tracking-tighter shrink-0">
                NID:{monitor.id.toString().padStart(3, "0")}
              </span>
            </div>

            <div className="overflow-hidden whitespace-nowrap relative h-5 flex items-center w-full min-w-0">
              <motion.h4
                initial={false}
                animate={isHovered ? { x: [0, -120, 0] } : { x: 0 }}
                transition={
                  isHovered
                    ? {
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                        type: "tween",
                      }
                    : { duration: 0.2, ease: "easeInOut", type: "tween" }
                }
                style={{ willChange: "transform" }}
                className="text-xs md:text-sm font-bold text-white/90 font-mono tracking-tighter uppercase italic leading-none block whitespace-nowrap"
              >
                {isHovered ? monitor.name : smartName}
              </motion.h4>
            </div>
          </div>
        </div>

        <div className="shrink-0 font-mono text-right ml-auto">
          {monitor.uptime !== null && (
            <div className="flex flex-col">
              <span className="text-[8px] text-white/30 tracking-tighter mb-1 uppercase">
                Availability
              </span>
              <span
                className={`text-xs font-black leading-none ${isUp ? "text-green-400" : "text-white/40"}`}
              >
                {monitor.uptime.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-2 left-1.5 w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner" />
      <div className="absolute bottom-2 left-1.5 w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner" />
      <div className="absolute top-2 right-1.5 w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner" />
      <div className="absolute bottom-2 right-1.5 w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner" />
    </div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수: monitor 객체의 id와 status, uptime만 비교
  if (prevProps.size !== nextProps.size) return false;
  if (!prevProps.monitor && !nextProps.monitor) return true;
  if (!prevProps.monitor || !nextProps.monitor) return false;
  return (
    prevProps.monitor.id === nextProps.monitor.id &&
    prevProps.monitor.status === nextProps.monitor.status &&
    prevProps.monitor.uptime === nextProps.monitor.uptime
  );
});

RackSlot.displayName = "RackSlot";

