"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import type { MonitorStatus } from "@/lib/api";
import { RackSlot } from "./RackSlot";
import {
  DEFAULT_DEVICE_U,
  TOTAL_RACK_U,
  RACK_BASE_LOAD_KG,
  RACK_LOAD_INCREMENT_PER_INDEX_KG,
} from "@/constants/monitoring";

interface RackComponentProps {
  name: string;
  monitors: MonitorStatus[];
  index: number;
}

/**
 * 랙 컴포넌트
 * 가이드라인: 단일 책임 원칙에 따라 랙 렌더링만 담당
 */
export const RackComponent = memo<RackComponentProps>(
  ({ name, monitors, index }) => {
    // generateRackLayout을 useMemo로 메모이제이션
    const layout = useMemo(() => {
      let currentU = TOTAL_RACK_U;
      const layoutArray: {
        u: number;
        size: number;
        monitor: MonitorStatus | null;
      }[] = [];

      monitors.forEach((monitor) => {
        if (currentU >= DEFAULT_DEVICE_U) {
          layoutArray.push({
            u: currentU,
            size: DEFAULT_DEVICE_U,
            monitor,
          });
          currentU -= DEFAULT_DEVICE_U;
        }
      });

      while (currentU > 0) {
        layoutArray.push({ u: currentU, size: 1, monitor: null });
        currentU -= 1;
      }

      return layoutArray;
    }, [monitors]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.1,
          duration: 0.8,
          ease: "easeOut",
          type: "tween",
        }}
        className="relative flex flex-col w-full min-w-0 overflow-hidden"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="flex justify-between items-end mb-4 px-4 font-mono">
          <div className="min-w-0 flex-1 mr-4">
            <span className="text-[10px] font-bold text-primary tracking-widest block uppercase mb-1">
              RACK UNIT
            </span>
            <h3 className="text-xl font-black text-white leading-none tracking-tighter uppercase italic wrap-break-word">
              {name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase block mb-1">
              RCK-42U-{(index + 1).toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] font-bold text-white/30 uppercase italic">
              {monitors.length} NODES
            </span>
          </div>
        </div>

        <div className="relative bg-[#0d0d0f] rounded-2xl p-4 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="relative flex bg-black rounded-xl overflow-hidden border-2 border-white/5 ring-1 ring-white/10 shadow-inner">
            <div className="w-10 flex flex-col border-r border-white/10 bg-[#080809]">
              {Array.from({ length: TOTAL_RACK_U }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 flex items-center justify-center border-b border-white/3"
                >
                  <span
                    className={`text-[9px] font-bold font-mono leading-none ${(TOTAL_RACK_U - i) % 5 === 0 ? "text-white/40" : "text-white/10"}`}
                  >
                    {TOTAL_RACK_U - i}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col bg-[#050506]">
              {layout.map((item, i) => (
                <RackSlot
                  key={item.monitor?.id || `blank-${i}`}
                  size={item.size}
                  monitor={item.monitor}
                />
              ))}
            </div>

            <div className="w-4 flex flex-col border-l border-white/10 bg-[#080809]">
              {Array.from({ length: TOTAL_RACK_U }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 flex items-center justify-center border-b border-white/3"
                >
                  <div className="w-1 h-1 rounded-full bg-white/5 shadow-inner" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center px-2 font-mono text-[9px] uppercase tracking-widest opacity-40">
            <div className="flex gap-6 text-white">
              <span className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-white/40 rounded-full" /> LOAD:{" "}
                {RACK_BASE_LOAD_KG + index * RACK_LOAD_INCREMENT_PER_INDEX_KG}KG
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />{" "}
                PWR: AC_OK
              </span>
            </div>
            <span className="animate-pulse text-primary font-bold">
              ● SYSTEM_LIVE
            </span>
          </div>
        </div>
      </motion.div>
    );
  },
);

RackComponent.displayName = "RackComponent";

