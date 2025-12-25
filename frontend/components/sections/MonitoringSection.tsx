"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useMonitoringStatus } from "@/hooks/useMonitoringStatus";
import { RackComponent } from "@/components/monitoring/RackComponent";
import { InsightsPanel } from "@/components/monitoring/InsightsPanel";
import {
  RACK_ORDER,
  MONITORING_REFRESH_INTERVAL_MS,
  LAST_UPDATE_TEXT_REFRESH_INTERVAL_MS,
  SECONDS_PER_MINUTE,
  SECONDS_PER_HOUR,
} from "@/constants/monitoring";
import type { MonitorStatus } from "@/lib/api";

/**
 * 모니터링 섹션 컴포넌트
 * 가이드라인: 컴포넌트 분리 및 커스텀 훅 사용으로 가독성 향상
 */
export function MonitoringSection() {
  const {
    monitors,
    summary,
    insights,
    loading,
    error,
    lastUpdate,
  } = useMonitoringStatus();

  // useMemo로 계산값 메모이제이션
  const groupedMonitors = useMemo(() => {
    return monitors.reduce((acc, monitor) => {
      const groupName = monitor.group || "Infrastructure";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(monitor);
      return acc;
    }, {} as Record<string, MonitorStatus[]>);
  }, [monitors]);

  // 정의된 순서대로 그룹 정렬 (메모이제이션)
  const sortedGroups = useMemo(() => {
    return Object.entries(groupedMonitors).sort(([a], [b]) => {
      const indexA = (RACK_ORDER as readonly string[]).indexOf(a);
      const indexB = (RACK_ORDER as readonly string[]).indexOf(b);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  }, [groupedMonitors]);

  // 전체 평균 가용성 계산 (메모이제이션)
  const averageUptime = useMemo(() => {
    if (monitors.length === 0) return 0;
    const monitorsWithUptime = monitors.filter((m) => m.uptime !== null);
    if (monitorsWithUptime.length === 0) return 0;
    return (
      monitorsWithUptime.reduce((sum, m) => sum + (m.uptime || 0), 0) /
      monitorsWithUptime.length
    );
  }, [monitors]);

  // 마지막 업데이트 시간 포맷 (1초마다 업데이트)
  const [lastUpdateText, setLastUpdateText] = useState("Never");

  useEffect(() => {
    if (!lastUpdate) {
      return;
    }

    const updateText = () => {
      if (!lastUpdate) return;
      const now = new Date();
      const diff = Math.floor(
        (now.getTime() - lastUpdate.getTime()) / 1000,
      );
      if (diff < SECONDS_PER_MINUTE) {
        setLastUpdateText(`${diff}s ago`);
      } else if (diff < SECONDS_PER_HOUR) {
        setLastUpdateText(`${Math.floor(diff / SECONDS_PER_MINUTE)}m ago`);
      } else {
        setLastUpdateText(
          lastUpdate.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      }
    };

    updateText();
    const interval = setInterval(
      updateText,
      LAST_UPDATE_TEXT_REFRESH_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <section className="relative z-10 w-full px-4 py-8 bg-[#020203]">
      <div className="max-w-[1800px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6 border-b border-white/5 pb-8">
            <div>
              <div className="flex items-center gap-3 text-primary mb-2">
                <span className="text-xs font-mono tracking-[0.3em] opacity-50 uppercase">
                  Infrastructure / Data Hall
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                MULTI RACK BAY
              </h1>
            </div>

            <div className="flex gap-12 font-mono text-white">
              <div className="text-right">
                <div className="text-[10px] text-white/40 uppercase mb-1 tracking-widest">
                  Active Racks
                </div>
                <div className="text-3xl font-bold leading-none">
                  {sortedGroups.length.toString().padStart(2, "0")}
                </div>
              </div>
              <div className="text-right border-l border-white/10 pl-12">
                <div className="text-[10px] text-white/40 uppercase mb-1 tracking-widest">
                  Global Status
                </div>
                <div className="text-3xl font-bold text-primary leading-none uppercase italic">
                  {summary.offline > 0 ? "Warning" : "Optimal"}
                </div>
              </div>
            </div>
          </div>

          {/* 통계 카드 및 컨트롤 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* 전체 가용성 카드 */}
            <div className="bg-[#0d0d0f] border border-white/10 rounded-xl p-4 font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">
                  Avg Availability
                </span>
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-white leading-none">
                {averageUptime > 0 ? `${averageUptime.toFixed(2)}%` : "N/A"}
              </div>
            </div>

            {/* Online 카드 */}
            <div className="bg-[#0d0d0f] border border-white/10 rounded-xl p-4 font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">
                  Online
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400 leading-none">
                {summary.online.toString().padStart(2, "0")}
              </div>
            </div>

            {/* Offline 카드 */}
            <div className="bg-[#0d0d0f] border border-white/10 rounded-xl p-4 font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">
                  Offline
                </span>
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400 leading-none">
                {summary.offline.toString().padStart(2, "0")}
              </div>
            </div>

            {/* Pending 카드 */}
            <div className="bg-[#0d0d0f] border border-white/10 rounded-xl p-4 font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">
                  Pending
                </span>
                <AlertCircle className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400 leading-none">
                {summary.pending.toString().padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* 컨트롤 바 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d0d0f] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/60 font-mono text-xs">
              <Clock className="w-4 h-4" />
              <span>Last update: {lastUpdateText}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 font-mono text-xs">
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-400"
              />
              <span>
                Auto-refresh: {MONITORING_REFRESH_INTERVAL_MS / 1000}s
              </span>
            </div>
          </div>
        </div>

        {loading && monitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="font-mono text-xs tracking-[0.5em] opacity-50 uppercase animate-pulse">
              Initializing Rack Bay...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="font-mono text-sm text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-12 items-start">
            {sortedGroups.map(([groupName, groupMonitors], rackIdx) => (
              <RackComponent
                key={groupName}
                name={groupName}
                monitors={groupMonitors}
                index={rackIdx}
              />
            ))}
            {/* NOC OVERVIEW 패널: 실제 데이터 전달 */}
            <div className="md:col-span-1 lg:col-span-1 2xl:col-span-3">
              <InsightsPanel index={sortedGroups.length} data={insights} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
