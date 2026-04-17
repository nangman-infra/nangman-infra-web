"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";

interface Project {
  id: string;
  name: string;
  description: {
    ko: string;
    en: string;
  };
  status: "live" | "archived";
  version?: string;
  url?: string;
}

const projects: Project[] = [
  {
    id: "when2work",
    name: "When2Work",
    description: {
      ko: "링크 하나로 팀원의 가능한 시간을 모으고, 가장 많이 겹치는 시간대를 빠르게 찾을 수 있는 일정 조율 서비스입니다.",
      en: "A scheduling service that collects team availability through a single link and quickly surfaces the most overlapping time slots.",
    },
    status: "live",
    url: "https://when2work.whitejbb.cloud",
  },
  {
    id: "touch-browser",
    name: "touch-browser",
    description: {
      ko: "웹 페이지를 AI 에이전트가 인용 가능한 구조화된 증거로 읽을 수 있도록 바꾸는 evidence-first 브라우징 도구입니다. read-view, compact-view, extract, session synthesis를 제공합니다.",
      en: "An evidence-first browsing tool that turns web pages into structured, citable evidence for AI agents, with read-view, compact-view, extract, and session synthesis.",
    },
    status: "live",
    version: "pilot-ready",
    url: "https://github.com/nangman-infra/touch-browser",
  },
  {
    id: "netlab",
    name: "Netlab",
    description: {
      ko: "네트워크 구축과 통신 작업을 도움주는 웹 애플리케이션",
      en: "A web application that assists with network construction and communication workflows.",
    },
    status: "live",
    url: "https://netlab.wisoft.io/",
  },
  {
    id: "lunar",
    name: "Lunar",
    description: {
      ko: "실시간으로 현재 달의 위상을 확인하고, 특정 날짜의 달 모양을 조회할 수 있는 웹 서비스입니다.",
      en: "A web service for checking the current moon phase in real time and looking up the moon on specific dates.",
    },
    status: "live",
    url: "https://lunar.wisoft.io/",
  },
  {
    id: "skt-usim",
    name: "SK텔레콤 유심 해킹 사건 종합 분석",
    description: {
      ko: "SK텔레콤 유심(USIM) 해킹 사건의 타임라인, 침해 분석, 대응 조치 등을 종합적으로 정리한 정보 제공 사이트입니다.",
      en: "An information site that consolidates the timeline, breach analysis, and response actions for the SK Telecom USIM hacking incident.",
    },
    status: "live",
    url: "https://skt-hack.wisoft.io/",
  },
  {
    id: "transnote",
    name: "Transnote",
    description: {
      ko: "회의 내용을 자동으로 정리하고 핵심 액션 아이템을 추출하는 AI 기반 회의록 작성 프로그램입니다.",
      en: "An AI meeting notes tool that structures conversations automatically and extracts key action items.",
    },
    status: "live",
    url: "https://transnote.nangman.cloud",
  },
];

export default function ProjectsPage() {
  const locale = useLocale() as AppLocale;
  const copy =
    locale === "ko"
      ? {
          title: "Projects & Case Studies",
          subtitle: "실제 운영 중인 서비스와 아키텍처 설계 사례입니다",
          live: "운영 중",
          archived: "보관됨",
          visit: "사이트 방문",
        }
      : {
          title: "Projects & Case Studies",
          subtitle: "Services and architecture case studies currently operated by the community.",
          live: "Live Service",
          archived: "Archived",
          visit: "Visit Site",
        };
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="relative max-w-7xl mx-auto">
      <motion.div
          initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12 md:space-y-16"
      >
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {copy.title}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {copy.subtitle}
        </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <div className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
                  <div className="relative z-10">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        project.status === "live"
                          ? "border-green-500/30 bg-green-500/10 text-green-500"
                          : "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground"
                      }`}>
                        {project.status === "live" ? copy.live : copy.archived}
                      </span>
                      {project.version && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {project.version}
                        </span>
                      )}
                    </div>
                
                    {/* Project Info */}
                    <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    
                    {project.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {project.description[locale]}
                      </p>
                    )}

                    {/* Action Links */}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <span>{copy.visit}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
        ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
