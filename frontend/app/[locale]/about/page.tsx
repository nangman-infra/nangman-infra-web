"use client";

import { motion } from "framer-motion";
import { Heart, TrendingUp, Users, Target, Users2, Calendar } from "lucide-react";
import { useLocale } from "next-intl";
import {
  ANIMATION_DURATION_SHORT,
  ANIMATION_DURATION_LONG,
  ANIMATION_DELAY_ABOUT_HEADER_SUBTITLE,
  ANIMATION_DELAY_ABOUT_MISSION_CARD_1,
  ANIMATION_DELAY_ABOUT_MISSION_CARD_2,
  ANIMATION_DELAY_ABOUT_TIMELINE_INCREMENT,
  ANIMATION_DELAY_ABOUT_VALUES_CARD_1,
  ANIMATION_DELAY_ABOUT_VALUES_CARD_2,
  ANIMATION_DELAY_ABOUT_VALUES_CARD_3,
} from "@/constants/members";

export default function AboutPage() {
  const locale = useLocale();
  const timeline = [
    {
      year: "2025.11",
      title: locale === "ko" ? "낭만 인프라 런칭" : "Nangman Infra Launch",
      desc:
        locale === "ko"
          ? "인프라 엔지니어링 커뮤니티, 낭만 인프라 공식 런칭"
          : "Official launch of the Nangman Infra infrastructure engineering community",
    },
  ];
  const copy =
    locale === "ko"
      ? {
          pageTitle: "Why Nangman?",
          pageDescription:
            "우리는 차가운 서버실에서 가장 뜨거운 열정을 찾습니다. 보이지 않는 곳에서 세상의 연결을 지탱하는 낭만있는 엔지니어들입니다.",
          missionTitle: "Our Mission",
          missionSubtitle: "우리의 목표와 역할",
          goalTitle: "우리의 목표",
          goalDescription:
            "안정적이고 효율적인 인프라를 구축하여 모든 서비스의 기반이 되는 것이 우리의 목표입니다. 보이지 않는 곳에서도 최선을 다하는 것이 낭만 인프라의 철학입니다.",
          roleTitle: "우리의 역할",
          roleDescription:
            "클라우드부터 온프레미스까지, 네트워크부터 보안까지. 인프라의 모든 영역을 아우르며 실무 경험과 학습을 통해 성장하는 엔지니어들의 모임입니다.",
          historyTitle: "Our History",
          historySubtitle: "낭만 인프라의 여정",
          valuesTitle: "Our Values",
          valuesSubtitle: "우리가 추구하는 가치",
          passionBody: "인프라에 대한 열정",
          passionDetail:
            "차가운 서버실에서도 가장 뜨거운 열정을 유지합니다. 보이지 않는 곳에서도 최선을 다하는 것이 우리의 신념입니다.",
          growthBody: "지속적인 학습과 성장",
          growthDetail:
            "실무 경험과 이론 학습을 병행하며 끊임없이 성장합니다. 멘토와 멘티가 함께 배우고 성장하는 환경을 만들어갑니다.",
          collaborationBody: "협업과 지식 공유",
          collaborationDetail:
            "개인의 성장보다 커뮤니티의 성장을 우선시합니다. 지식을 공유하고 함께 문제를 해결하며 더 나은 인프라를 만들어갑니다.",
        }
      : {
          pageTitle: "Why Nangman?",
          pageDescription:
            "We look for the hottest passion in the coldest server rooms. We are engineers who support the world’s connections behind the scenes.",
          missionTitle: "Our Mission",
          missionSubtitle: "Why we exist and how we work",
          goalTitle: "Our Goal",
          goalDescription:
            "Our goal is to build stable and efficient infrastructure that becomes the foundation of every service. Doing our best in invisible places is core to Nangman Infra.",
          roleTitle: "Our Role",
          roleDescription:
            "From cloud to on-premises, from networking to security, we are a group of engineers growing through practical experience and learning across the full infrastructure stack.",
          historyTitle: "Our History",
          historySubtitle: "The journey of Nangman Infra",
          valuesTitle: "Our Values",
          valuesSubtitle: "What we optimize for as a community",
          passionBody: "Passion for infrastructure",
          passionDetail:
            "We keep strong passion even in the coldest server rooms. Our belief is to do excellent work where users never look.",
          growthBody: "Continuous learning and growth",
          growthDetail:
            "We grow through both hands-on work and theory. Mentors and mentees learn together in the same environment.",
          collaborationBody: "Collaboration and knowledge sharing",
          collaborationDetail:
            "We value community growth over individual growth. We share knowledge, solve problems together, and build better infrastructure.",
        };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="relative max-w-7xl mx-auto">
        <div className="space-y-12 md:space-y-16">
          {/* Page Header */}
          <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION_DURATION_LONG, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-4xl font-bold mb-4"
        >
          {copy.pageTitle.split(" ")[0]} <span className="text-primary">{copy.pageTitle.split(" ").slice(1).join(" ")}</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION_DURATION_LONG, delay: ANIMATION_DELAY_ABOUT_HEADER_SUBTITLE, ease: [0.16, 1, 0.3, 1] }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
              {copy.pageDescription}
        </motion.p>
          </div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_DURATION_LONG, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{copy.missionTitle}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {copy.missionSubtitle}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: ANIMATION_DURATION_SHORT, delay: ANIMATION_DELAY_ABOUT_MISSION_CARD_1 }}
                className="h-full"
              >
                <div className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{copy.goalTitle}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {copy.goalDescription}
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: ANIMATION_DURATION_SHORT, delay: ANIMATION_DELAY_ABOUT_MISSION_CARD_2 }}
                className="h-full"
              >
                <div className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Users2 className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{copy.roleTitle}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {copy.roleDescription}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_DURATION_LONG, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{copy.historyTitle}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {copy.historySubtitle}
              </p>
            </div>
            <div className="grid md:grid-cols-1 gap-6 max-w-2xl mx-auto">
          {timeline.map((item, index) => (
            <motion.div 
              key={`${item.year}-${item.title}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION_DURATION_SHORT, delay: index * ANIMATION_DELAY_ABOUT_TIMELINE_INCREMENT }}
              className="h-full"
            >
              <div className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-mono text-primary mb-2 block">{item.year}</span>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_DURATION_LONG, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{copy.valuesTitle}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {copy.valuesSubtitle}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: ANIMATION_DURATION_SHORT, delay: ANIMATION_DELAY_ABOUT_VALUES_CARD_1 }}
                className="h-full"
              >
                <div className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-mono text-lg font-bold text-primary">Passion</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {copy.passionBody}
                    </p>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">
                      {copy.passionDetail}
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: ANIMATION_DURATION_SHORT, delay: ANIMATION_DELAY_ABOUT_VALUES_CARD_2 }}
                className="h-full"
              >
                <div className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-mono text-lg font-bold text-primary">Growth</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {copy.growthBody}
                    </p>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">
                      {copy.growthDetail}
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: ANIMATION_DURATION_SHORT, delay: ANIMATION_DELAY_ABOUT_VALUES_CARD_3 }}
                className="h-full"
              >
                <div className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-mono text-lg font-bold text-primary">Collaboration</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {copy.collaborationBody}
                    </p>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">
                      {copy.collaborationDetail}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
