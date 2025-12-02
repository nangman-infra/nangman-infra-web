"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MessageSquare, Users, Briefcase } from "lucide-react";

export function SeniorsSection() {
  return (
    <section className="relative z-10 w-full px-4 py-12 md:py-16">
      <div className="relative max-w-7xl mx-auto">
        <div className="space-y-8 md:space-y-12">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              선배들과 함께합니다
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              AWS, Equinix에서 근무하는 선배들과 함께 성장합니다
            </p>
          </motion.div>

          {/* Seniors Profile Cards - Symmetric Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* AWS Senior Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full"
            >
              <div className="gpu-accelerated-blur group relative h-full p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Company Logo */}
                <div className="mb-6 flex items-center justify-center">
                  <div className="relative w-32 h-16">
                    <Image
                      src="/logos/Amazon_Web_Services_Logo.svg.png"
                      alt="AWS"
                      fill
                      sizes="128px"
                      className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>

                {/* Senior Info */}
                <div className="text-center space-y-4 relative z-10">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">AWS 인프라 엔지니어 선배</h3>
                    <p className="text-muted-foreground text-sm">실무 경험을 나누며 함께 성장합니다</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Equinix Senior Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full"
            >
              <div className="gpu-accelerated-blur group relative h-full p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Company Logo */}
                <div className="mb-6 flex items-center justify-center">
                  <div className="relative w-32 h-16">
                    <Image
                      src="/logos/Equinix_logo.svg.png"
                      alt="Equinix"
                      fill
                      sizes="128px"
                      className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>

                {/* Senior Info */}
                <div className="text-center space-y-4 relative z-10">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Equinix 인프라 엔지니어 선배</h3>
                    <p className="text-muted-foreground text-sm">실무 경험을 나누며 함께 성장합니다</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Collaboration Activities - Center Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8">
            {/* Mentoring Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="gpu-accelerated-blur group p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">멘토링</h3>
                <p className="text-sm text-muted-foreground">
                  실무 경험과 조언을 나눕니다
                </p>
              </div>
            </motion.div>

            {/* Networking Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="gpu-accelerated-blur group p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
                <Users className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">네트워킹</h3>
                <p className="text-sm text-muted-foreground">
                  함께 연결되고 소통합니다
                </p>
              </div>
            </motion.div>

            {/* Career Guidance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="gpu-accelerated-blur group p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
                <Briefcase className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">진로 상담</h3>
                <p className="text-sm text-muted-foreground">
                  취업과 진로에 대한 조언을 받습니다
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
