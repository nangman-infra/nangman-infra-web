"use client";

import { motion } from "framer-motion";
import { Terminal as TerminalIcon, Network, Monitor, Server, Cloud, Box, FileCode, Shield, BarChart3, Rocket } from "lucide-react";

export function CurriculumSection() {
  return (
    <section className="relative z-10 w-full px-4 py-12 md:py-16">
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 md:space-y-12"
        >
          {/* Section Title */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              학습 커리큘럼
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              기초부터 실무까지 체계적으로 배웁니다
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Linux Commands - Large Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative col-span-1 md:col-span-2 lg:col-span-2 p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <TerminalIcon className="w-10 h-10 mb-4 text-primary relative z-10" />
              <h3 className="text-xl md:text-2xl font-semibold mb-2 relative z-10">리눅스 명령어</h3>
              <p className="text-muted-foreground text-sm md:text-base relative z-10 mb-4">
                Shell, 파일 시스템, 프로세스 관리의 기초를 다집니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['Shell', '파일 시스템', '프로세스', 'Systemd'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-1 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Network */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="group relative col-span-1 lg:col-span-1 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Network className="w-8 h-8 mb-4 text-primary relative z-10" />
              <h3 className="text-lg font-semibold mb-2 relative z-10">네트워크</h3>
              <p className="text-muted-foreground text-sm relative z-10 mb-3">
                TCP/IP, DNS, 라우팅의 원리를 이해합니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['TCP/IP', 'DNS', '라우팅'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Operating System */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative col-span-1 lg:col-span-1 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Monitor className="w-8 h-8 mb-4 text-primary relative z-10" />
              <h3 className="text-lg font-semibold mb-2 relative z-10">운영체제</h3>
              <p className="text-muted-foreground text-sm relative z-10 mb-3">
                Linux 커널과 시스템 관리의 핵심을 배웁니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['커널', '시스템 관리'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Hardware Infrastructure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="group relative col-span-1 lg:col-span-1 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Server className="w-8 h-8 mb-4 text-primary relative z-10" />
              <h3 className="text-lg font-semibold mb-2 relative z-10">하드웨어 인프라</h3>
              <p className="text-muted-foreground text-sm relative z-10 mb-3">
                서버, 스토리지, 데이터센터의 물리적 구조를 이해합니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['서버', '스토리지'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* AWS Cloud */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group relative col-span-1 md:col-span-2 lg:col-span-1 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Cloud className="w-8 h-8 mb-4 text-primary relative z-10" />
              <h3 className="text-lg font-semibold mb-2 relative z-10">AWS 클라우드</h3>
              <p className="text-muted-foreground text-sm relative z-10 mb-3">
                EC2, S3, VPC 등 AWS 핵심 서비스를 실습합니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['EC2', 'S3', 'VPC', 'RDS'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="group relative col-span-1 lg:col-span-1 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Box className="w-8 h-8 mb-4 text-primary relative z-10" />
              <h3 className="text-lg font-semibold mb-2 relative z-10">컨테이너</h3>
              <p className="text-muted-foreground text-sm relative z-10 mb-3">
                Docker와 Kubernetes로 컨테이너 오케스트레이션을 배웁니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['Docker', 'K8s'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* IaC */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group relative col-span-1 lg:col-span-1 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <FileCode className="w-8 h-8 mb-4 text-primary relative z-10" />
              <h3 className="text-lg font-semibold mb-2 relative z-10">IaC</h3>
              <p className="text-muted-foreground text-sm relative z-10 mb-3">
                Infrastructure as Code로 인프라를 코드로 관리합니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['Terraform', 'CloudFormation'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="group relative col-span-1 lg:col-span-1 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Shield className="w-8 h-8 mb-4 text-primary relative z-10" />
              <h3 className="text-lg font-semibold mb-2 relative z-10">기초 보안</h3>
              <p className="text-muted-foreground text-sm relative z-10 mb-3">
                방화벽, 암호화, 접근 제어의 기초를 배웁니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['방화벽', '암호화', '접근 제어'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Monitoring & Logging */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="group relative col-span-1 lg:col-span-1 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <BarChart3 className="w-8 h-8 mb-4 text-primary relative z-10" />
              <h3 className="text-lg font-semibold mb-2 relative z-10">모니터링 & 로깅</h3>
              <p className="text-muted-foreground text-sm relative z-10 mb-3">
                시스템 상태를 모니터링하고 로그를 분석합니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['Prometheus', 'Grafana', 'ELK Stack'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Real-world Project */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="group relative col-span-1 md:col-span-2 lg:col-span-2 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Rocket className="w-8 h-8 mb-4 text-primary relative z-10" />
              <h3 className="text-lg font-semibold mb-2 relative z-10">실무 프로젝트</h3>
              <p className="text-muted-foreground text-sm relative z-10 mb-3">
                학습한 내용을 종합하여 실제 서비스를 구축하고 운영합니다
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {['프로젝트', '실전', '운영'].map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

