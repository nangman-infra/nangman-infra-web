"use client";

import { useEffect } from "react";
import { MonitoringSection } from "@/components/sections/MonitoringSection";

export default function MonitoringPage() {
  useEffect(() => {
    document.title = "인프라 모니터링 | Nangman Infra";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#020203]">
      <MonitoringSection />
    </div>
  );
}
