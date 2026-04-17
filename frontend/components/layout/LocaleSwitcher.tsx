"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const t = useTranslations("Locale");
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-background/40 px-1 py-1 text-[11px] font-medium uppercase tracking-[0.2em]">
      <span className="sr-only">{t("label")}</span>
      {routing.locales.map((nextLocale) => {
        const isActive = locale === nextLocale;

        return (
          <Link
            key={nextLocale}
            href={pathname}
            locale={nextLocale}
            className={cn(
              "rounded px-2 py-1 transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(nextLocale)}
          </Link>
        );
      })}
    </div>
  );
}
