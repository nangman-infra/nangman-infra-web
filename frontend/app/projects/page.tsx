"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useEffect } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "live" | "archived";
  version?: string;
  url?: string;
}

const projects: Project[] = [
  {
    id: "netlab",
    name: "Netlab",
    description: "네트워크 구축과 통신 작업을 도움주는 웹 애플리케이션",
    status: "live",
  },
  {
    id: "bano",
    name: "반오(Ban.O) 밴드 공식 웹사이트",
    description: "싱어송라이터 반오(Ban.O)의 음악, 영상, 공연 정보를 제공하는 공식 아티스트 포트폴리오입니다.",
    status: "live",
  },
  {
    id: "skt-usim",
    name: "SKT 유심 해킹 사건 분석",
    description: "SK텔레콤 유심(USIM) 해킹 사건의 타임라인, 침해 분석, 대응 조치 등을 종합적으로 정리한 정보 제공 사이트입니다.",
    status: "live",
  },
  {
    id: "lunar",
    name: "Lunar - 달의 실시간 위상",
    description: "실시간으로 현재 달의 위상을 확인하고, 특정 날짜의 달 모양을 조회할 수 있는 웹 서비스입니다.",
    status: "live",
  },
  {
    id: "papyrus",
    name: "Papyrus - PDF 번역도구",
    description: "PDF 문서를 업로드하면, 설정된 언어로 텍스트를 자동 번역해주는 웹 기반 번역 도구입니다.",
    status: "live",
  },
];

export default function ProjectsPage() {
  useEffect(() => {
    document.title = "Projects & Case Studies | Nangman Infra";
  }, []);

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
              Projects & Case Studies
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              실제 운영 중인 서비스와 아키텍처 설계 사례입니다
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
                className="group relative p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      project.status === "live"
                        ? "border-green-500/30 bg-green-500/10 text-green-500"
                        : "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground"
                    }`}>
                      {project.status === "live" ? "Live Service" : "Archived"}
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
                      {project.description}
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
                      <span>Visit Site</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
