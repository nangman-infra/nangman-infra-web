"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonitoringStatusResponse } from "@/lib/api";
import { TOTAL_RACK_U, MAX_LOG_DISPLAY_COUNT } from "@/constants/monitoring";

type InsightsData = NonNullable<MonitoringStatusResponse["data"]>["insights"];

interface InsightsPanelProps {
  index: number;
  data: InsightsData | null;
}

const MIN_CHART_DATA_POINTS = 2;
const MIN_CHART_SCALE_MBPS = 1;
const CHART_SCALE_MULTIPLIER = 1.2;

/**
 * 인사이트 패널 컴포넌트
 * 가이드라인: 단일 책임 원칙에 따라 인사이트 표시만 담당
 */
export const InsightsPanel = memo<InsightsPanelProps>(({ index, data }) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.network.traffic.history.map((h) => ({
      ...h,
      outboundNeg: -h.outbound,
    }));
  }, [data]);

  const yDomain = useMemo((): [number, number] => {
    if (chartData.length === 0) return [0, 0];
    const maxVal = Math.max(
      ...chartData.map((h) => Math.max(h.inbound, h.outbound)),
    );
    // 최소 1 Mbps 스케일 보장
    const limit = Math.max(maxVal * CHART_SCALE_MULTIPLIER, MIN_CHART_SCALE_MBPS);
    return [-limit, limit];
  }, [chartData]);

  const displayedLogs = useMemo(() => {
    if (!data?.logs) return [];
    return data.logs.slice(0, MAX_LOG_DISPLAY_COUNT);
  }, [data]);

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
      className="relative flex flex-col w-full h-full min-w-0 overflow-hidden"
      style={{ willChange: "transform, opacity" }}
    >
      <div className="flex justify-between items-end mb-4 px-4 font-mono">
        <div className="min-w-0 flex-1 mr-4">
          <span className="text-[10px] font-bold text-primary tracking-widest block uppercase mb-1">
            ANALYTICS
          </span>
          <h3 className="text-xl font-black text-white leading-none tracking-tighter uppercase italic">
            NOC OVERVIEW
          </h3>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase block mb-1">
            PROBE-STATION
          </span>
          <span className="text-[10px] font-bold text-white/30 uppercase italic">
            REAL-TIME METRICS
          </span>
        </div>
      </div>

      <div className="relative bg-[#0d0d0f] rounded-2xl p-4 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden h-full">
        <div className="relative flex bg-black rounded-xl overflow-hidden border-2 border-white/5 ring-1 ring-white/10 shadow-inner h-full min-h-[1008px]">
          {/* 42U 눈금 (랙과 동일하게 유지) */}
          <div className="w-10 flex flex-col border-r border-white/10 bg-[#080809] shrink-0">
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

          {/* 내부 컨텐츠 영역: 넓어질 경우 가로 배치를 위해 Grid 사용 */}
          <div className="flex-1 grid grid-cols-1 2xl:grid-cols-3 bg-[#050506] p-6 gap-8">
            {/* 1. Traffic Section */}
            <TrafficSection data={data} chartData={chartData} yDomain={yDomain} />

            {/* 2. Core Nodes Matrix & System Resources */}
            <SystemResourcesSection data={data} />

            {/* 3. Terminal Log Section */}
            <LogSection logs={displayedLogs} />
          </div>

          <div className="w-4 flex flex-col border-l border-white/10 bg-[#080809] shrink-0">
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
              <div className="w-1 h-1 bg-white/40 rounded-full" /> MODULE:
              NOC-STATION-01
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />{" "}
              STATUS: NOMINAL
            </span>
          </div>
          <span className="text-primary font-bold">
            READY TO STREAM OVERWIDE
          </span>
        </div>
      </div>
    </motion.div>
  );
});

InsightsPanel.displayName = "InsightsPanel";

// Traffic Section 서브 컴포넌트
function TrafficSection({
  data,
  chartData,
  yDomain,
}: {
  data: InsightsData | null;
  chartData: Array<{ timestamp: string; inbound: number; outbound: number; outboundNeg: number }>;
  yDomain: [number, number];
}) {
  return (
    <div className="flex flex-col gap-4 2xl:col-span-2">
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-white/60 tracking-[0.2em] uppercase">
            Network Traffic Trend
          </span>
          {data && (
            <div className="flex gap-4 text-[9px] font-mono">
              <span className="text-primary">
                IN: {data.network.traffic.inbound} Mbps
              </span>
              <span className="text-blue-400">
                OUT: {data.network.traffic.outbound} Mbps
              </span>
            </div>
          )}
        </div>
        <span className="text-[8px] font-mono text-primary animate-pulse">
          ● LIVE STREAM
        </span>
      </div>

      <div className="flex-1 min-h-[400px] w-full bg-black/40 rounded-lg border border-white/5 relative overflow-hidden flex flex-col p-4">
        <div className="flex-1 w-full h-full min-h-[300px]">
          {!data || chartData.length < MIN_CHART_DATA_POINTS ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
              <Activity className="w-8 h-8 text-white/10 animate-pulse" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">
                  Collecting Traffic Data...
                </span>
                <span className="text-[8px] font-mono text-white/10 uppercase italic">
                  Awaiting Second Data Point (30s)
                </span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chartIn" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="chartOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis dataKey="timestamp" hide padding={{ left: 0, right: 0 }} />
                <YAxis domain={yDomain} hide />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{
                    stroke: "rgba(255,255,255,0.2)",
                    strokeWidth: 1,
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const inbound = payload.find(
                        (p) => p.dataKey === "inbound",
                      )?.value;
                      const outbound = payload.find(
                        (p) => p.dataKey === "outboundNeg",
                      )?.value;

                      return (
                        <div className="bg-[#0d0d0f]/90 border border-white/10 p-4 rounded-xl font-mono shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-white/5">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                            <Clock className="w-3 h-3 text-white/40" />
                            <span className="text-[10px] text-white/60 tracking-tighter uppercase">
                              {payload[0].payload.timestamp}
                            </span>
                          </div>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-12">
                              <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                <div className="flex flex-col">
                                  <span className="text-[8px] text-white/30 leading-none uppercase mb-1">
                                    Inbound
                                  </span>
                                  <span className="text-xs text-white/90 font-bold leading-none">
                                    TRAFFIC_IN
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-primary italic leading-none">
                                  {inbound}
                                </span>
                                <span className="text-[9px] text-primary/40 font-bold ml-1 uppercase">
                                  Mbps
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-12">
                              <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <div className="flex flex-col">
                                  <span className="text-[8px] text-white/30 leading-none uppercase mb-1">
                                    Outbound
                                  </span>
                                  <span className="text-xs text-white/90 font-bold leading-none">
                                    TRAFFIC_OUT
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-blue-400 italic leading-none">
                                  {Math.abs(outbound as number)}
                                </span>
                                <span className="text-[9px] text-blue-400/40 font-bold ml-1 uppercase">
                                  Mbps
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  stroke="var(--color-primary)"
                  strokeWidth={4}
                  strokeOpacity={0.1}
                  fill="none"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#chartIn)"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#fff",
                    stroke: "var(--color-primary)",
                    strokeWidth: 2,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="outboundNeg"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  strokeOpacity={0.1}
                  fill="none"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="outboundNeg"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#chartOut)"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#fff",
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 하단 지표 슬롯 */}
        {data && (
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5 font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] text-white/30 uppercase tracking-tighter">
                Packets In/Out
              </span>
              <span className="text-[10px] text-white/80 font-bold">
                {data.network.traffic.inboundPps} /{" "}
                {data.network.traffic.outboundPps} PPS
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] text-white/30 uppercase tracking-tighter">
                Active Connections
              </span>
              <span className="text-[10px] text-white/80 font-bold">
                {data.network.traffic.activeConnections} ESTABLISHED
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] text-white/30 uppercase tracking-tighter">
                Interface Speed
              </span>
              <span className="text-[10px] text-white/80 font-bold">
                10.0 Gbps (Full Duplex)
              </span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-[8px] text-white/30 uppercase tracking-tighter">
                Probe Node
              </span>
              <span className="text-[10px] text-primary font-bold animate-pulse">
                KR-SEOUL-DC-01
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// System Resources Section 서브 컴포넌트
function SystemResourcesSection({
  data,
}: {
  data: InsightsData | null;
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* System Resource Cluster */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-black text-white/60 tracking-[0.2em] uppercase">
            System Resource Cluster
          </span>
          <div className="flex items-center gap-2 font-mono text-[9px]">
            <span className="text-white/20">LOAD:</span>
            <span className="text-primary font-bold">
              {data?.system.load
                .map((l: number) => l.toFixed(2))
                .join(" / ") || "0.00 / 0.00 / 0.00"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* CPU Usage */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-mono text-white/40 uppercase">
                Cluster CPU Usage
              </span>
              <span className="text-[10px] font-bold text-white font-mono">
                {data?.system.cpu.toFixed(1) || "0.0"}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data?.system.cpu || 0}%` }}
                className="h-full bg-linear-to-r from-primary/40 to-primary shadow-[0_0_10px_rgba(251,191,36,0.3)]"
              />
            </div>
          </div>

          {/* Memory Usage */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-mono text-white/40 uppercase">
                Memory Allocation
              </span>
              <span className="text-[10px] font-bold text-white font-mono">
                {data
                  ? `${(data.system.memory.used / 1024 / 1024 / 1024).toFixed(1)}GB / ${(data.system.memory.total / 1024 / 1024 / 1024).toFixed(1)}GB`
                  : "0.0GB / 0.0GB"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data?.system.memory.percentage || 0}%` }}
                className="h-full bg-linear-to-r from-blue-500/40 to-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]"
              />
            </div>
          </div>

          {/* Advanced Metrics */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex justify-between items-center bg-white/5 px-2 py-1.5 rounded border border-white/5">
              <span className="text-[8px] font-mono text-white/20 uppercase">
                I/O Wait
              </span>
              <span className="text-[9px] font-mono text-green-400 font-bold">
                {data?.system.ioWait.toFixed(2) || "0.00"}%
              </span>
            </div>
            <div className="flex justify-between items-center bg-white/5 px-2 py-1.5 rounded border border-white/5">
              <span className="text-[8px] font-mono text-white/20 uppercase">
                Steal Time
              </span>
              <span className="text-[9px] font-mono text-white/60 font-bold">
                {data?.system.stealTime.toFixed(2) || "0.00"}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Probes */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-[10px] font-black text-white/60 tracking-[0.2em] uppercase">
            Core Probes
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-1 gap-3">
          {[
            {
              label: "DNS PROPAGATION",
              value: data ? "OPTIMAL" : "PENDING",
              detail: `Response: ${data?.network.dnsLatency || 0}ms`,
            },
            {
              label: "GATEWAY LATENCY",
              value: data
                ? `${data.network.gatewayLatency.toFixed(1)}ms`
                : "0.0ms",
              detail: "First Hop Status",
            },
            {
              label: "BACKBONE PING",
              value: data
                ? `${data.network.backbonePing.toFixed(1)}ms`
                : "0.0ms",
              detail: "KR-IX / KT-Backbone",
            },
            {
              label: "SSL INTEGRITY",
              value: data?.network.sslStatus || "PENDING",
              detail: "Auto-Renewal Active",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/5 border border-white/5 p-4 rounded-lg flex flex-col gap-1 hover:bg-white/10 transition-colors"
            >
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-tighter">
                {item.label}
              </span>
              <span className="text-sm font-black text-white font-mono">
                {item.value}
              </span>
              <span className="text-[8px] font-mono text-primary/40 uppercase tracking-tighter mt-1">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Log Section 서브 컴포넌트
function LogSection({
  logs,
}: {
  logs: Array<{
    timestamp: string;
    level: string;
    source: string;
    message: string;
  }>;
}) {
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "WARN":
        return "text-yellow-400";
      case "ALERT":
        return "text-red-400";
      case "SUCCESS":
        return "text-green-400";
      case "PROBE":
        return "text-primary";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className="flex flex-col gap-4 2xl:col-span-3 mt-4">
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <span className="text-[10px] font-black text-white/60 tracking-[0.2em] uppercase">
          Infrastructure Automation Logs
        </span>
      </div>
      <div className="h-64 bg-black/50 rounded-lg p-6 font-mono text-[11px] overflow-hidden border border-white/5 leading-relaxed shadow-inner">
        {logs.length > 0 ? (
          logs.map((log, idx) => (
            <div
              key={`${log.timestamp}-${idx}`}
              className="flex gap-3 mb-2 animate-in fade-in slide-in-from-left-2 duration-300"
            >
              <span className="text-white/20 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour12: false,
                })}
              </span>
              <span className={`shrink-0 font-bold ${getLogLevelColor(log.level)}`}>
                [{log.level}]
              </span>
              <span className="text-white/40 shrink-0 italic">{log.source}</span>
              <span className="text-white/80">{log.message}</span>
            </div>
          ))
        ) : (
          <div className="text-white/20 italic">Awaiting System Events...</div>
        )}
      </div>
    </div>
  );
}

