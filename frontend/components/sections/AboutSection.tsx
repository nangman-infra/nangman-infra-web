"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";

export function AboutSection() {
  const locale = useLocale();
  const copy =
    locale === "ko"
      ? {
          title: "낭만 인프라 소개",
          lines: [
            "사용자는 보지 못하지만, 모든 서비스의 기반이 됩니다.",
            "보이지 않는 곳에서 세상의 연결을 지탱하는 엔지니어들,",
            "인프라 엔지니어링 커뮤니티, 낭만 인프라입니다.",
          ],
          quote: '"보이지 않지만, 모든 것의 기반이 됩니다"',
        }
      : {
          title: "About Us",
          lines: [
            "Users may never see it, but it supports every service they rely on.",
            "We are engineers who sustain the world’s connections behind the scenes,",
            "an infrastructure engineering community called Nangman Infra.",
          ],
          quote: '"Invisible, but foundational to everything."',
        };
  return (
    <section className="relative z-10 w-full px-4 pt-2 md:pt-4 pb-12 md:pb-16">
      <div className="relative max-w-4xl mx-auto">
        {/* Main Content - Integrated Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-6 md:space-y-8"
        >
          {/* Section Title - Integrated */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {copy.title}
            </h2>
          </div>

          {/* Content - Clean Typography */}
          <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
            {copy.lines.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className={
                  index === copy.lines.length - 1
                    ? "text-xl md:text-2xl text-foreground font-semibold leading-relaxed"
                    : "text-lg md:text-xl text-muted-foreground leading-relaxed"
                }
              >
                {line}
              </p>
            ))}
          </div>

          {/* Highlight Quote - Centered Design */}
          <div className="pt-4 md:pt-6">
            <p className="text-xl md:text-2xl font-bold text-primary leading-relaxed max-w-2xl mx-auto">
              {copy.quote}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
