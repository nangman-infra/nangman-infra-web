"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { Service } from "@/constants/services";
import { cn } from "@/lib/utils";
import {
  SERVICE_CARD_ANIMATION_DURATION,
  SERVICE_CARD_ANIMATION_DELAY_INCREMENT,
  SERVICE_CARD_IMAGE_LOAD_DELAY_MS,
  SERVICE_CARD_INITIAL_Y_OFFSET,
  SERVICE_CARD_HOVER_Y_OFFSET,
  SERVICE_CARD_HOVER_SCALE,
  SERVICE_CARD_PRIORITY_THRESHOLD,
  SERVICE_CARD_EASE_CURVE,
} from "@/constants/animations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  service: Service;
  index: number;
}

/**
 * 아이콘 URL 생성
 * 로컬 파일(.svg, .webp 등)인 경우 /services/ 경로 사용
 * Simple Icons인 경우 CDN URL 사용
 */
function getIconUrl(iconName: string): string {
  // 파일 확장자가 있으면 로컬 파일로 간주
  if (iconName.includes('.')) {
    return `/services/${iconName}`;
  }
  // Simple Icons CDN URL
  return `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${iconName}.svg`;
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const hasUrl = Boolean(service.url);
  const hasUrls = Boolean(service.urls && service.urls.length > 0);
  const hasIcon = Boolean(service.icon);
  const isClickable = hasUrl || hasUrls;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(!hasIcon); // 아이콘이 없으면 바로 에러 상태
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 이미지 로드 완료 후 애니메이션 시작 (Safari 깜빡임 방지)
  useEffect(() => {
    if (imageLoaded || imageError) {
      // 약간의 지연을 두어 이미지가 완전히 렌더링된 후 애니메이션 시작
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, SERVICE_CARD_IMAGE_LOAD_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, imageError]);

  const cardContent = (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: SERVICE_CARD_INITIAL_Y_OFFSET } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldAnimate
          ? {
              duration: SERVICE_CARD_ANIMATION_DURATION,
              delay: index * SERVICE_CARD_ANIMATION_DELAY_INCREMENT,
              ease: SERVICE_CARD_EASE_CURVE,
            }
          : { duration: 0 }
      }
      whileHover={isClickable ? { y: SERVICE_CARD_HOVER_Y_OFFSET, scale: SERVICE_CARD_HOVER_SCALE } : {}}
      style={{ willChange: "transform, opacity" }}
      className={cn(
        "gpu-accelerated-blur group relative h-full p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm transition-all duration-500",
        isClickable
          ? "hover:border-primary/40 hover:bg-card/30 cursor-pointer"
          : "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Icon Container - 고정 크기로 레이아웃 시프트 방지 */}
      <div className="relative w-16 h-16 mb-4 flex items-center justify-center shrink-0" style={{ minHeight: "64px" }}>
        {hasIcon && !imageError ? (
          <>
            {/* 로딩 플레이스홀더 */}
            {!imageLoaded && (
              <div 
                className="absolute inset-0 bg-muted/10 rounded animate-pulse"
                style={{ transform: "translateZ(0)" }}
              />
            )}
            <Image
              src={getIconUrl(service.icon!)}
              alt={service.name}
              fill
              sizes="64px"
              priority={index < SERVICE_CARD_PRIORITY_THRESHOLD}
              className={cn(
                "object-contain transition-opacity duration-300",
                // Simple Icons만 다크 모드 필터 적용 (로컬 파일은 원본 색상 유지)
                !service.icon!.includes('.') && "dark:invert dark:brightness-[0.6] dark:saturate-[0.3] dark:opacity-80",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              style={{ transform: "translateZ(0)" }}
            />
          </>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center bg-muted/10 rounded border border-border/20"
            style={{ transform: "translateZ(0)" }}
          >
            <span className="text-xs font-mono text-muted-foreground">
              {service.name[0]}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          {isClickable && (
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            isClickable ? "bg-green-500" : "bg-muted-foreground/30"
          )}
        />
      </div>
    </motion.div>
  );

  // 다중 URL이 있는 경우 (NGINX Proxy Manager 등)
  if (hasUrls && service.urls) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <div className="h-full cursor-pointer">
            {cardContent}
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{service.name}</DialogTitle>
            <DialogDescription>
              접근할 서버를 선택하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {service.urls.map((urlOption, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  window.open(urlOption.url, '_blank', 'noopener,noreferrer');
                  setDialogOpen(false);
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {urlOption.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 단일 URL이 있는 경우
  if (hasUrl && service.url) {
    return (
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {cardContent}
      </a>
    );
  }

  return <div className="h-full">{cardContent}</div>;
}
