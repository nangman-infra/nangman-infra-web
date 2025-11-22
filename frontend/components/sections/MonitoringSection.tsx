"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Wifi, AlertCircle, Clock, Globe, Network, Zap } from "lucide-react";

// NetworkInformation interface for TypeScript
interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
}

interface Metric {
  value: string | number;
  label: string;
  status: "healthy" | "warning" | "critical";
  icon: React.ReactNode;
}

export function MonitoringSection() {
  const [metrics, setMetrics] = useState<{
    pageLoadTime: number;
    networkType: string;
    errorCount: number;
    resourceLoadTime: number;
    resourceCount: number;
    domSize: number;
    onlineStatus: boolean;
    connectionSpeed: number;
    browserInfo: string;
    screenResolution: string;
    publicIP: string;
    renderTime: number;
    viewport: string;
  }>({
    pageLoadTime: 0,
    networkType: "unknown",
    errorCount: 0,
    resourceLoadTime: 0,
    resourceCount: 0,
    domSize: 0,
    onlineStatus: true,
    connectionSpeed: 0,
    browserInfo: "unknown",
    screenResolution: "unknown",
    publicIP: "Loading...",
    renderTime: 0,
    viewport: "N/A",
  });

  // Initialize metrics on mount
  useEffect(() => {
    // Helper function to get network connection
    const getNetworkConnection = (): NetworkInformation | null => {
      if (typeof navigator === "undefined") return null;
      const nav = navigator as Navigator & {
        connection?: NetworkInformation;
        mozConnection?: NetworkInformation;
        webkitConnection?: NetworkInformation;
      };
      return nav.connection || nav.mozConnection || nav.webkitConnection || null;
    };

    // Batch all initial state updates into a single setMetrics call
    const updateInitialMetrics = () => {
      const updates: Partial<typeof metrics> = {};

      // Performance Metrics
      if (typeof window !== "undefined" && window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        // Resource loading metrics
        const resources = window.performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        const resourceCount = resources.length;
        const resourceLoadTime = resources.reduce((sum, resource) => {
          return sum + (resource.responseEnd - resource.startTime);
        }, 0) / (resourceCount || 1);

        // Render time (DOMContentLoaded to Load)
        const renderTime = perfData.loadEventEnd - perfData.domContentLoadedEventEnd;

        updates.pageLoadTime = pageLoadTime;
        updates.resourceLoadTime = Math.round(resourceLoadTime);
        updates.resourceCount = resourceCount;
        updates.renderTime = Math.round(renderTime);
      }

      // DOM Size
      if (typeof document !== "undefined") {
        updates.domSize = document.getElementsByTagName("*").length;
      }

      // Network Information
      if (typeof navigator !== "undefined") {
        const connection = getNetworkConnection();
        if (connection) {
          updates.networkType = connection.effectiveType || "unknown";
          updates.connectionSpeed = connection.downlink || 0;
        }

        // Online Status
        updates.onlineStatus = navigator.onLine;

        // Browser Info
        const userAgent = navigator.userAgent;
        let browser = "unknown";
        if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
        else if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
        else if (userAgent.indexOf("Safari") > -1) browser = "Safari";
        else if (userAgent.indexOf("Edge") > -1) browser = "Edge";
        updates.browserInfo = browser;
      }

      // Screen Resolution & Viewport
      if (typeof window !== "undefined") {
        updates.screenResolution = `${window.screen.width}x${window.screen.height}`;
        updates.viewport = `${window.innerWidth}x${window.innerHeight}`;

        // Error Count (from sessionStorage - session only)
        updates.errorCount = parseInt(sessionStorage.getItem("errorCount") || "0", 10);
      }

      // Apply all updates at once
      setMetrics((prev) => ({ ...prev, ...updates }));
    };

    // Use requestAnimationFrame to batch updates
    if (typeof window !== "undefined") {
      requestAnimationFrame(updateInitialMetrics);
    }

    // Public IP (using ipify API)
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data: { ip?: string }) => {
        setMetrics((prev) => ({ ...prev, publicIP: data.ip || "Unknown" }));
      })
      .catch(() => {
        setMetrics((prev) => ({ ...prev, publicIP: "N/A" }));
      });

    // Event listeners setup
    if (typeof window === "undefined") return;

    // Handle viewport resize
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setMetrics((prev) => ({
          ...prev,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        }));
      }
    };

    // Listen for online/offline changes
    const handleOnline = () => setMetrics((prev) => ({ ...prev, onlineStatus: true }));
    const handleOffline = () => setMetrics((prev) => ({ ...prev, onlineStatus: false }));

    window.addEventListener("resize", handleResize);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for network changes
    let connectionCleanup: (() => void) | undefined;
    if (typeof navigator !== "undefined") {
      const getNetworkConnection = (): NetworkInformation | null => {
        const nav = navigator as Navigator & {
          connection?: NetworkInformation;
          mozConnection?: NetworkInformation;
          webkitConnection?: NetworkInformation;
        };
        return nav.connection || nav.mozConnection || nav.webkitConnection || null;
      };

      const connection = getNetworkConnection();
      if (connection) {
        const handleConnectionChange = () => {
          setMetrics((prev) => ({
            ...prev,
            networkType: connection.effectiveType || "unknown",
            connectionSpeed: connection.downlink || 0,
          }));
        };
        connection.addEventListener("change", handleConnectionChange);
        connectionCleanup = () => {
          connection.removeEventListener("change", handleConnectionChange);
        };
      }
    }

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connectionCleanup) {
        connectionCleanup();
      }
    };
  }, []);

  // Error tracking - Session only
  useEffect(() => {
    const handleError = () => {
      const errorCount = parseInt(sessionStorage.getItem("errorCount") || "0", 10) + 1;
      sessionStorage.setItem("errorCount", errorCount.toString());
      setMetrics((prev) => ({ ...prev, errorCount }));
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  const getStatus = (value: number, thresholds: { warning: number; critical: number }): "healthy" | "warning" | "critical" => {
    if (value >= thresholds.critical) return "critical";
    if (value >= thresholds.warning) return "warning";
    return "healthy";
  };

  const getNetworkStatus = (): "healthy" | "warning" | "critical" => {
    if (!metrics.onlineStatus) return "critical";
    if (metrics.networkType === "4g" || metrics.networkType === "5g") return "healthy";
    if (metrics.networkType === "3g") return "warning";
    return "critical";
  };

  const kpiMetrics: Metric[] = [
    {
      value: `${metrics.pageLoadTime}ms`,
      label: "Page Load Time",
      status: getStatus(metrics.pageLoadTime, { warning: 2000, critical: 3000 }),
      icon: <Clock className="w-5 h-5" />,
    },
    {
      value: `${metrics.resourceLoadTime}ms`,
      label: "Resource Load",
      status: getStatus(metrics.resourceLoadTime, { warning: 1000, critical: 2000 }),
      icon: <Zap className="w-5 h-5" />,
    },
    {
      value: metrics.networkType.toUpperCase(),
      label: "Network",
      status: getNetworkStatus(),
      icon: <Wifi className="w-5 h-5" />,
    },
    {
      value: metrics.errorCount,
      label: "Errors",
      status: getStatus(metrics.errorCount, { warning: 3, critical: 5 }),
      icon: <AlertCircle className="w-5 h-5" />,
    },
  ];

  const statusColors = {
    healthy: "text-[#00ff00]",
    warning: "text-[#ffff00]",
    critical: "text-[#ff0000]",
  };

  const statusBgColors = {
    healthy: "bg-[#00ff00]/10 border-[#00ff00]/30",
    warning: "bg-[#ffff00]/10 border-[#ffff00]/30",
    critical: "bg-[#ff0000]/10 border-[#ff0000]/30",
  };

  return (
    <section className="relative z-10 w-full px-4 py-16 md:py-20">
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10 md:space-y-14"
        >
          {/* Section Title - More Subtle */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              실시간 모니터링
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              시스템 상태를 실시간으로 확인합니다
            </p>
          </div>

          {/* KPI Cards - Top Row - More Spaced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {kpiMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative p-5 md:p-6 rounded-lg border border-border/20 bg-card/10 backdrop-blur-sm transition-all duration-500 hover:bg-card/20 hover:border-border/40 ${statusBgColors[metric.status]}`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-1.5 rounded-md ${statusBgColors[metric.status]}`}>
                      <div className={statusColors[metric.status]}>{metric.icon}</div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusColors[metric.status]}`}></div>
                  </div>
                  <div className="space-y-1">
                    <div className={`text-xl md:text-2xl font-bold font-mono ${statusColors[metric.status]}`}>
                      {metric.value}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">{metric.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detailed Metrics - Bottom Row - More Spaced, Simplified */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Network Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group relative p-5 md:p-6 rounded-lg border border-border/20 bg-card/10 backdrop-blur-sm hover:bg-card/20 hover:border-border/40 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Network className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold">Network</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={metrics.onlineStatus ? "text-[#00ff00]" : "text-[#ff0000]"}>
                      {metrics.onlineStatus ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-mono">{metrics.networkType.toUpperCase()}</span>
                  </div>
                  {metrics.connectionSpeed > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Speed:</span>
                      <span className="font-mono">{metrics.connectionSpeed.toFixed(1)} Mbps</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Public IP:</span>
                    <span className="font-mono text-xs break-all text-right ml-2">{metrics.publicIP}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="group relative p-5 md:p-6 rounded-lg border border-border/20 bg-card/10 backdrop-blur-sm hover:bg-card/20 hover:border-border/40 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold">Performance</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Render Time:</span>
                    <span className="font-mono">{metrics.renderTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resources:</span>
                    <span className="font-mono">{metrics.resourceCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DOM Size:</span>
                    <span className="font-mono">{metrics.domSize.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Browser Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="group relative p-5 md:p-6 rounded-lg border border-border/20 bg-card/10 backdrop-blur-sm hover:bg-card/20 hover:border-border/40 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold">Environment</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Browser:</span>
                    <span className="font-mono">{metrics.browserInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution:</span>
                    <span className="font-mono">{metrics.screenResolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Viewport:</span>
                    <span className="font-mono">{metrics.viewport}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

