"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare, ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

export function ContactSection() {
  const locale = useLocale();
  const copy =
    locale === "ko"
      ? {
          title: "함께하고 싶으신가요?",
          subtitle: "프로젝트 협업, 채용, 기술 교류 등 언제든 환영합니다",
          location: "위치",
          email: "이메일",
          cta: "문의하기",
          address: "대전광역시 유성구 동서대로 125",
        }
      : {
          title: "Want to Work Together?",
          subtitle: "We welcome collaboration, hiring, and technical exchange.",
          location: "Location",
          email: "Email",
          cta: "Contact Us",
          address: "125 Dongseo-daero, Yuseong-gu, Daejeon",
        };
  return (
    <section className="relative z-10 w-full px-4 py-12 md:py-16">
      <div className="relative max-w-6xl mx-auto">
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
              {copy.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {copy.subtitle}
            </p>
          </motion.div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Location Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full"
            >
              <div className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{copy.location}</h3>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {copy.address}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full"
            >
              <div className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{copy.email}</h3>
                  </div>
                  <a
                    href="mailto:contact@nangman.cloud"
                    className="text-base text-primary hover:text-primary/80 transition-colors font-mono break-all"
                  >
                    contact@nangman.cloud
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA Button - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center pt-4"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium hover:gap-3 shadow-[0_0_20px_-5px_var(--primary)] hover:shadow-[0_0_40px_-5px_var(--primary)] min-h-[44px] touch-manipulation"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{copy.cta}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
