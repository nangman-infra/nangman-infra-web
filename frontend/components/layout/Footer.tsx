"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Mail, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { GitHubIcon } from "@/components/icons/GitHubIcon";

const navItems = [
  { href: "/about", label: { ko: "소개", en: "About" } },
  { href: "/incidents", label: { ko: "장애 이력", en: "Incidents" } },
  { href: "/members", label: { ko: "멤버", en: "Members" } },
  { href: "/projects", label: { ko: "프로젝트", en: "Projects" } },
  { href: "/blog", label: { ko: "블로그", en: "Blog" } },
  { href: "/contact", label: { ko: "문의", en: "Contact" } },
] as const;

function resolveLocaleText(
  locale: string,
  value: Readonly<Record<AppLocale, string>>,
): string {
  return locale === "en" ? value.en : value.ko;
}

export function Footer() {
  const locale = useLocale();
  const navigationTitle = locale === "en" ? "Navigation" : "바로가기";
  const contactTitle = locale === "en" ? "Contact" : "연락처";
  const copyright = "© 2025 Nangman Infra. All rights reserved.";

  return (
    <footer className="relative z-10 w-full border-t border-border/20 bg-background/40 backdrop-blur-sm gpu-accelerated-blur">
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 md:space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <Link href="/" className="inline-block group">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-600 font-bold tracking-tight text-xl">
                  Nangman Infra
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {locale === "en"
                  ? "Invisible, but always essential."
                  : "보이지 않지만, 우리는 함께합니다."}
                <br />
                {locale === "en"
                  ? "We study the foundations of infrastructure."
                  : "인프라의 근본을 탐구합니다."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {navigationTitle}
              </h3>
              <nav className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                  >
                    {resolveLocaleText(locale, item.label)}
                  </Link>
                ))}
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {contactTitle}
              </h3>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <a
                  href="mailto:contact@nangman.cloud"
                  className="flex items-center gap-2 hover:text-primary transition-colors w-fit"
                >
                  <Mail className="w-4 h-4" />
                  <span>contact@nangman.cloud</span>
                </a>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {locale === "en"
                      ? "125 Dongseo-daero, Yuseong-gu, Daejeon"
                      : "대전광역시 유성구 동서대로 125"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="h-px bg-linear-to-r from-transparent via-border/30 to-transparent" />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <p className="text-xs text-muted-foreground font-mono">{copyright}</p>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/nangman-infra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <GitHubIcon className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
