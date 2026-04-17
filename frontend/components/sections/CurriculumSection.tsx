"use client";

import { motion } from "framer-motion";
import {
  Terminal as TerminalIcon,
  Network,
  Monitor,
  Server,
  Cloud,
  Box,
  FileCode,
  Shield,
  BarChart3,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

type CurriculumCardKey =
  | "linux"
  | "networking"
  | "os"
  | "hardware"
  | "aws"
  | "containers"
  | "iac"
  | "security"
  | "monitoring"
  | "projects";

type CurriculumCardConfig = Readonly<{
  key: CurriculumCardKey;
  icon: LucideIcon;
  delay: number;
  containerClassName: string;
  paddingClassName: string;
  iconClassName: string;
  titleClassName: string;
  descriptionClassName: string;
  topicClassName: string;
}>;

const cardConfigs: readonly CurriculumCardConfig[] = [
  {
    key: "linux",
    icon: TerminalIcon,
    delay: 0.1,
    containerClassName: "col-span-1 md:col-span-2 lg:col-span-2 h-full",
    paddingClassName: "p-6 md:p-8",
    iconClassName: "w-10 h-10 mb-4 text-primary relative z-10",
    titleClassName: "text-xl md:text-2xl font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm md:text-base relative z-10 mb-4",
    topicClassName:
      "px-2.5 py-1 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
  {
    key: "networking",
    icon: Network,
    delay: 0.15,
    containerClassName: "col-span-1 lg:col-span-1 h-full",
    paddingClassName: "p-6",
    iconClassName: "w-8 h-8 mb-4 text-primary relative z-10",
    titleClassName: "text-lg font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm relative z-10 mb-3",
    topicClassName:
      "px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
  {
    key: "os",
    icon: Monitor,
    delay: 0.2,
    containerClassName: "col-span-1 lg:col-span-1 h-full",
    paddingClassName: "p-6",
    iconClassName: "w-8 h-8 mb-4 text-primary relative z-10",
    titleClassName: "text-lg font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm relative z-10 mb-3",
    topicClassName:
      "px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
  {
    key: "hardware",
    icon: Server,
    delay: 0.25,
    containerClassName: "col-span-1 lg:col-span-1 h-full",
    paddingClassName: "p-6",
    iconClassName: "w-8 h-8 mb-4 text-primary relative z-10",
    titleClassName: "text-lg font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm relative z-10 mb-3",
    topicClassName:
      "px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
  {
    key: "aws",
    icon: Cloud,
    delay: 0.3,
    containerClassName: "col-span-1 md:col-span-2 lg:col-span-1 h-full",
    paddingClassName: "p-6",
    iconClassName: "w-8 h-8 mb-4 text-primary relative z-10",
    titleClassName: "text-lg font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm relative z-10 mb-3",
    topicClassName:
      "px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
  {
    key: "containers",
    icon: Box,
    delay: 0.35,
    containerClassName: "col-span-1 lg:col-span-1 h-full",
    paddingClassName: "p-6",
    iconClassName: "w-8 h-8 mb-4 text-primary relative z-10",
    titleClassName: "text-lg font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm relative z-10 mb-3",
    topicClassName:
      "px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
  {
    key: "iac",
    icon: FileCode,
    delay: 0.4,
    containerClassName: "col-span-1 lg:col-span-1 h-full",
    paddingClassName: "p-6",
    iconClassName: "w-8 h-8 mb-4 text-primary relative z-10",
    titleClassName: "text-lg font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm relative z-10 mb-3",
    topicClassName:
      "px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
  {
    key: "security",
    icon: Shield,
    delay: 0.45,
    containerClassName: "col-span-1 lg:col-span-1 h-full",
    paddingClassName: "p-6",
    iconClassName: "w-8 h-8 mb-4 text-primary relative z-10",
    titleClassName: "text-lg font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm relative z-10 mb-3",
    topicClassName:
      "px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
  {
    key: "monitoring",
    icon: BarChart3,
    delay: 0.5,
    containerClassName: "col-span-1 lg:col-span-1 h-full",
    paddingClassName: "p-6",
    iconClassName: "w-8 h-8 mb-4 text-primary relative z-10",
    titleClassName: "text-lg font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm relative z-10 mb-3",
    topicClassName:
      "px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
  {
    key: "projects",
    icon: Rocket,
    delay: 0.55,
    containerClassName: "col-span-1 md:col-span-2 lg:col-span-2 h-full",
    paddingClassName: "p-6",
    iconClassName: "w-8 h-8 mb-4 text-primary relative z-10",
    titleClassName: "text-lg font-semibold mb-2 relative z-10",
    descriptionClassName: "text-muted-foreground text-sm relative z-10 mb-3",
    topicClassName:
      "px-2 py-0.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground",
  },
];

function getCardTopics(
  rawTopics: unknown,
  cardKey: CurriculumCardKey,
): string[] {
  if (Array.isArray(rawTopics) && rawTopics.every((topic) => typeof topic === "string")) {
    return rawTopics;
  }

  throw new Error(`CurriculumSection cards.${cardKey}.topics must be a string array.`);
}

export function CurriculumSection() {
  const t = useTranslations("CurriculumSection");

  return (
    <section className="relative z-10 w-full px-4 py-12 md:py-16">
      <div className="relative max-w-7xl mx-auto">
        <div className="space-y-8 md:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("title")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {cardConfigs.map((card) => {
              const Icon = card.icon;
              const topics = getCardTopics(t.raw(`cards.${card.key}.topics`), card.key);

              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: card.delay }}
                  className={card.containerClassName}
                >
                  <div className={`gpu-accelerated-blur group relative h-full rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 ${card.paddingClassName}`}>
                    <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Icon className={card.iconClassName} />
                    <h3 className={card.titleClassName}>{t(`cards.${card.key}.title`)}</h3>
                    <p className={card.descriptionClassName}>
                      {t(`cards.${card.key}.description`)}
                    </p>
                    <div className="flex flex-wrap gap-2 relative z-10">
                      {topics.map((topic) => (
                        <span key={`${card.key}-${topic}`} className={card.topicClassName}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
