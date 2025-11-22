"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us | Nangman Infra";
  }, []);
  const timeline = [
    { year: "2024", title: "Team Formation", desc: "국립한밭대학교 인프라 엔지니어링 팀 결성" },
    { year: "2024", title: "First Deployment", desc: "학내 연구실 서버 인프라 구축 및 운영 시작" },
    { year: "2025", title: "Nangman Infra v1", desc: "공식 홈페이지 및 포트폴리오 허브 런칭" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
      {/* Mission Section */}
      <section className="mb-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-2"
        >
          Why <span className="text-primary">Nangman?</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4"
        >
          우리는 차가운 서버실에서 가장 뜨거운 열정을 찾습니다.<br/>
          보이지 않는 곳에서 세상의 연결을 지탱하는<br/>
          <span className="text-foreground font-semibold">낭만있는 건축가들</span>입니다.
        </motion.p>
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

      {/* Organization Section Placeholder */}
      <section>
        <h2 className="text-2xl font-bold mb-8 pl-4 border-l-4 border-primary">Organization</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Placeholders for Org Chart */}
          {['Lead', 'Infrastructure', 'Security'].map((role) => (
            <div key={role} className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <h3 className="font-mono text-lg font-bold text-primary mb-2">{role} Team</h3>
              <p className="text-sm text-muted-foreground">Responsible for core system stability and performance.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
