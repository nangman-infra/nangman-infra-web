"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ServiceCard } from "@/components/services/ServiceCard";
import {
  SERVICES,
  SERVICE_CATEGORIES,
  CATEGORY_LABELS,
  type Service,
} from "@/constants/services";
import {
  SERVICE_PAGE_SECTION_DURATION,
  SERVICE_PAGE_SECTION_DELAY,
  SERVICE_PAGE_SECTION_INITIAL_Y,
} from "@/constants/animations";

/**
 * 서비스 페이지
 * 가이드라인: 서비스에 대한 통합 접근 페이지
 */
export default function ServicesPage() {
  useEffect(() => {
    document.title = "서비스 | Nangman Infra";
  }, []);

  // 카테고리별 그룹화된 서비스
  const groupedServices = useMemo(() => {
    const grouped: Record<Service["category"], Service[]> = {} as Record<
      Service["category"],
      Service[]
    >;
    SERVICES.forEach((service) => {
      if (!grouped[service.category]) {
        grouped[service.category] = [];
      }
      grouped[service.category].push(service);
    });
    return grouped;
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="relative max-w-7xl mx-auto">
        {/* Services Content - 카테고리별 그룹화된 표시 */}
        <div className="space-y-12">
          {SERVICE_CATEGORIES.map((category) => {
            const categoryServices = groupedServices[category];
            if (!categoryServices || categoryServices.length === 0) {
              return null;
            }
            return (
              <motion.section
                key={category}
                initial={{ opacity: 0, y: SERVICE_PAGE_SECTION_INITIAL_Y }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: SERVICE_PAGE_SECTION_DURATION, delay: SERVICE_PAGE_SECTION_DELAY }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    ({categoryServices.length})
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                  style={{ willChange: "contents" }}
                >
                  {categoryServices.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={index}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
