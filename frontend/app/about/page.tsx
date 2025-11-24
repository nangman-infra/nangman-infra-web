"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Heart, TrendingUp, Users } from "lucide-react";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us | Nangman Infra";
  }, []);
  const timeline = [
    { year: "2025.11", title: "낭만 인프라 런칭", desc: "국립한밭대학교 인프라 엔지니어링 팀, 낭만 인프라 공식 런칭" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
      {/* Mission Section */}
      <section className="mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-2">
            Why <span className="text-primary">Nangman?</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 mb-12">
            우리는 차가운 서버실에서 가장 뜨거운 열정을 찾습니다.<br/>
            보이지 않는 곳에서 세상의 연결을 지탱하는<br/>
            <span className="text-foreground font-semibold">낭만있는 엔지니어들</span>입니다.
          </p>
          <div className="space-y-8 max-w-4xl mx-auto mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative p-8 md:p-10 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground">우리의 목표</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  안정적이고 효율적인 인프라를 구축하여 모든 서비스의 기반이 되는 것이 우리의 목표입니다. 보이지 않는 곳에서도 최선을 다하는 것이 낭만 인프라의 철학입니다.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative p-8 md:p-10 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground">우리의 역할</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  클라우드부터 온프레미스까지, 네트워크부터 보안까지. 인프라의 모든 영역을 아우르며 실무 경험과 학습을 통해 성장하는 엔지니어들의 모임입니다.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-8 pl-4 border-l-4 border-primary">Our History</h2>
        <div className="relative border-l border-border ml-4 md:ml-10 space-y-10 pb-10">
          {timeline.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 md:pl-12"
            >
              <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
              <span className="text-sm font-mono text-primary mb-1 block">{item.year}</span>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 pl-4 border-l-4 border-primary">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group p-6 md:p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-mono text-lg font-bold text-primary">Passion</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                인프라에 대한 열정
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                차가운 서버실에서도 가장 뜨거운 열정을 유지합니다. 보이지 않는 곳에서도 최선을 다하는 것이 우리의 신념입니다.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group p-6 md:p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-mono text-lg font-bold text-primary">Growth</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                지속적인 학습과 성장
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                실무 경험과 이론 학습을 병행하며 끊임없이 성장합니다. 멘토와 학생이 함께 배우고 성장하는 환경을 만들어갑니다.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group p-6 md:p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-mono text-lg font-bold text-primary">Collaboration</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                협업과 지식 공유
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                개인의 성장보다 팀의 성장을 우선시합니다. 지식을 공유하고 함께 문제를 해결하며 더 나은 인프라를 만들어갑니다.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
