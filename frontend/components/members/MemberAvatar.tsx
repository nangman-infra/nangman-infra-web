"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name: string;
  profileImage?: string;
  sizeClassName: string;
  sizes: string;
  fallbackClassName: string;
  imageClassName?: string;
}

function normalizeMemberProfileImage(profileImage?: string): string | null {
  if (!profileImage || typeof profileImage !== "string") {
    return null;
  }

  const trimmed = profileImage.trim();
  if (!trimmed) {
    return null;
  }

  const normalizedRelative = trimmed
    .replace(/^\/?profile\//, "/profiles/")
    .replace(/^profiles\//, "/profiles/");

  if (normalizedRelative.startsWith("/profiles/")) {
    return normalizedRelative;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    parsed.pathname = parsed.pathname
      .replace(/^\/profile\//, "/profiles/")
      .replace(/^\/profiles\//, "/profiles/");

    if (parsed.pathname.startsWith("/profiles/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return null;
  }

  return null;
}

export function MemberAvatar({
  name,
  profileImage,
  sizeClassName,
  sizes,
  fallbackClassName,
  imageClassName,
}: MemberAvatarProps) {
  const normalizedImage = useMemo(
    () => normalizeMemberProfileImage(profileImage),
    [profileImage],
  );
  const [failedImageSource, setFailedImageSource] = useState<string | null>(
    null,
  );
  const shouldRenderImage =
    Boolean(normalizedImage) && normalizedImage !== failedImageSource;

  return (
    <div className={cn("relative shrink-0", sizeClassName)}>
      {shouldRenderImage ? (
        <Image
          src={normalizedImage!}
          alt={name}
          fill
          sizes={sizes}
          className={cn("rounded-full object-cover", imageClassName)}
          onError={() => {
            if (!normalizedImage) {
              return;
            }

            setFailedImageSource(normalizedImage);
          }}
        />
      ) : (
        <div className={fallbackClassName}>{name[0]}</div>
      )}
    </div>
  );
}
