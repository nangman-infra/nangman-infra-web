"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const navItems = [
  { href: "/", label: { ko: "홈", en: "Home" } },
  { href: "/about", label: { ko: "소개", en: "About" } },
  { href: "/services", label: { ko: "서비스", en: "Services" } },
  { href: "/monitoring", label: { ko: "모니터링", en: "Monitoring" } },
  { href: "/incidents", label: { ko: "장애 이력", en: "Incidents" } },
  { href: "/members", label: { ko: "멤버", en: "Members" } },
  { href: "/projects", label: { ko: "프로젝트", en: "Projects" } },
  { href: "/blog", label: { ko: "블로그", en: "Blog" } },
] as const;

function resolveLocaleText(
  locale: string,
  value: Readonly<Record<AppLocale, string>>,
): string {
  return value[(locale === "en" ? "en" : "ko") as AppLocale];
}

export function Header() {
  const pathname = usePathname();
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contactLabel = locale === "en" ? "Contact" : "문의";
  const menuLabel = locale === "en" ? "Open menu" : "메뉴 열기";
  const githubLabel = locale === "en" ? "GitHub repository" : "GitHub 저장소";

  useEffect(() => {
    const handleScroll = () => {
      const nextScrolled = globalThis.scrollY > 50;
      setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
    };

    handleScroll();
    globalThis.addEventListener("scroll", handleScroll, { passive: true });

    return () => globalThis.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    globalThis.addEventListener("keydown", handleEscape);

    return () => {
      globalThis.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 gpu-accelerated-blur",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50"
          : "bg-transparent",
      )}
    >
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      <div
        className="container mx-auto flex h-16 items-center gap-3 px-4 relative"
        style={{ background: "transparent" }}
      >
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-600 font-bold tracking-tight text-lg whitespace-nowrap">
            Nangman Infra
          </span>
        </Link>

        <nav className="hidden xl:flex min-w-0 flex-1 items-center justify-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative whitespace-nowrap px-3 xl:px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                    transition={{ type: "spring", duration: 0.6 }}
                  />
                )}
                {resolveLocaleText(locale, item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden md:flex">
            <LocaleSwitcher />
          </div>
          <Link
            href="https://github.com/nangman-infra"
            target="_blank"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={githubLabel}
          >
            <GitHubIcon className="w-5 h-5" />
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              className="hidden xl:flex border-primary/20 hover:bg-primary/10 text-primary"
            >
              {contactLabel}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={menuLabel}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="xl:hidden absolute top-16 left-0 right-0"
        >
          <div className="gpu-accelerated-blur max-h-[calc(100vh-4rem)] overflow-y-auto bg-background/95 backdrop-blur-md border-b border-border/50">
            <nav id="mobile-navigation" className="flex flex-col py-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 text-base font-medium transition-colors",
                      isActive
                        ? "text-primary bg-primary/10 border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    {resolveLocaleText(locale, item.label)}
                  </Link>
                );
              })}

              <div className="px-4 py-3">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-10 items-center rounded-md border border-primary/20 px-3 text-primary transition-colors hover:bg-primary/10"
                >
                  {contactLabel}
                </Link>
              </div>

              <div className="px-4 py-3">
                <LocaleSwitcher />
              </div>

              <div className="px-4 py-3 border-t border-border/50 mt-2">
                <Link
                  href="https://github.com/nangman-infra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <GitHubIcon className="w-5 h-5" />
                  <span>GitHub</span>
                </Link>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
}
