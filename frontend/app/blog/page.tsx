"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function BlogPage() {
  useEffect(() => {
    document.title = "기술 블로그 | Nangman Infra";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Engineering Log</h1>
        <p className="text-muted-foreground">
          트러블 슈팅 경험과 기술적인 인사이트를 공유합니다.
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Blog Post Item */}
        {[1, 2, 3].map((item) => (
          <motion.article
            key={item}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item * 0.1 }}
            className="group flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors cursor-pointer touch-manipulation"
          >
            <div className="flex-1">
              <div className="flex gap-2 mb-3 text-xs font-mono text-primary">
                <span>#Kubernetes</span>
                <span>#Troubleshooting</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                AWS EKS 환경에서의 오토스케일링 최적화 여정
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                트래픽 스파이크 발생 시 Pod 초기화 지연 문제를 해결하기 위해 Karpenter를 도입하고 Warm Pool을 구성했던 경험을 공유합니다.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>2025. 03. 15</span>
                <span>·</span>
                <span>By Sungwon</span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
