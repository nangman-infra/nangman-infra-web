"use client";

import { motion } from "framer-motion";
import type { Member } from "@/types/member";
import {
  ANIMATION_DURATION_SHORT,
  ANIMATION_DELAY_MEMBER_CARD_INCREMENT,
  MAX_DISPLAY_ACHIEVEMENTS,
  MAX_DISPLAY_CERTIFICATIONS,
} from "@/constants/members";
import { MemberAvatar } from "@/components/members/MemberAvatar";

type MemberCardProps = Readonly<{
  member: Member;
  index: number;
  baseDelay: number;
  isSenior?: boolean;
  onClick?: (member: Member) => void;
}>;

type MemberCardContentProps = Readonly<{
  member: Member;
  isSenior: boolean;
}>;

const CARD_BASE_CLASS_NAME =
  "gpu-accelerated-blur group relative flex h-full flex-col rounded-xl border border-border/30 bg-card/20 p-6 md:p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:bg-card/30";
const INTERACTIVE_CARD_CLASS_NAME =
  "w-full cursor-pointer appearance-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";
const STATIC_CARD_CLASS_NAME = "w-full";

function MemberHeader({ member, isSenior }: MemberCardContentProps) {
  const titleClassName = isSenior ? "text-xl md:text-2xl" : "text-lg";
  const affiliationClassName = isSenior ? "" : "text-muted-foreground/80";
  const avatarSizeClassName = isSenior ? "w-20 h-20 md:w-24 md:h-24" : "w-16 h-16";
  const avatarSizes = isSenior ? "96px" : "64px";
  const avatarFallbackClassName = "w-full h-full rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors text-lg md:text-xl lg:text-2xl";

  return (
    <div className="flex items-start gap-4">
      <MemberAvatar
        name={member.name}
        profileImage={member.profileImage}
        sizeClassName={avatarSizeClassName}
        sizes={avatarSizes}
        fallbackClassName={avatarFallbackClassName}
      />
      <div className={`flex-1 min-w-0 ${isSenior ? "pt-1" : ""}`}>
        <h3 className={`font-semibold mb-1 ${titleClassName}`}>{member.name}</h3>
        <p className="text-muted-foreground text-sm font-mono mb-1">{member.role}</p>
        {member.affiliation && (
          <p className={`text-xs text-muted-foreground/70 mb-2 ${affiliationClassName}`}>
            {member.affiliation}
          </p>
        )}
        {member.experience && (
          <p className="text-xs text-muted-foreground/80">{member.experience}</p>
        )}
      </div>
    </div>
  );
}

function MemberSpecialties({ member, isSenior }: MemberCardContentProps) {
  if (!member.specialties?.length) {
    return null;
  }

  const tagSizeClassName = isSenior ? "px-3 py-1" : "";

  return (
    <div className="flex flex-wrap gap-2">
      {member.specialties.map((specialty) => (
        <span
          key={specialty}
          className={`px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary font-mono ${tagSizeClassName}`}
        >
          {specialty}
        </span>
      ))}
    </div>
  );
}

function MemberHighlights({ member, isSenior }: MemberCardContentProps) {
  const certifications = member.certifications ?? [];
  const achievements = member.achievements ?? [];
  const itemGapClassName = isSenior ? "gap-2" : "gap-1.5";
  const bulletSizeClassName = isSenior ? "w-1.5 h-1.5" : "w-1 h-1";

  if (certifications.length > 0) {
    return (
      <div className="pt-2 border-t border-border/20 mt-auto">
        <div className={`grid grid-cols-1 ${itemGapClassName}`}>
          {certifications.slice(0, MAX_DISPLAY_CERTIFICATIONS).map((cert) => (
            <div
              key={`${cert.name}-${cert.issuer}-${cert.date ?? "unknown"}`}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span className={`rounded-full bg-primary/60 shrink-0 ${bulletSizeClassName}`} />
              <span>{cert.name}</span>
            </div>
          ))}
          {certifications.length > MAX_DISPLAY_CERTIFICATIONS && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
              <span className={`rounded-full bg-primary/40 shrink-0 ${bulletSizeClassName}`} />
              <span>외 {certifications.length - MAX_DISPLAY_CERTIFICATIONS}개</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return null;
  }

  return (
    <div className="pt-2 border-t border-border/20 mt-auto">
      <div className={`grid grid-cols-1 ${itemGapClassName}`}>
        {achievements.slice(0, MAX_DISPLAY_ACHIEVEMENTS).map((achievement) => (
          <div
            key={achievement}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span className={`rounded-full bg-primary/60 shrink-0 ${bulletSizeClassName}`} />
            <span>{achievement}</span>
          </div>
        ))}
        {achievements.length > MAX_DISPLAY_ACHIEVEMENTS && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <span className={`rounded-full bg-primary/40 shrink-0 ${bulletSizeClassName}`} />
            <span>외 {achievements.length - MAX_DISPLAY_ACHIEVEMENTS}개</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCardContent({ member, isSenior }: MemberCardContentProps) {
  return (
    <>
      <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 flex h-full flex-col gap-4">
        <MemberHeader member={member} isSenior={isSenior} />
        {member.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
        )}
        <MemberSpecialties member={member} isSenior={isSenior} />
        <MemberHighlights member={member} isSenior={isSenior} />
      </div>
    </>
  );
}

export function MemberCard({
  member,
  index,
  baseDelay,
  isSenior = false,
  onClick,
}: MemberCardProps) {
  const transition = {
    duration: ANIMATION_DURATION_SHORT,
    delay: baseDelay + index * ANIMATION_DELAY_MEMBER_CARD_INCREMENT,
  };
  const content = <MemberCardContent member={member} isSenior={isSenior} />;

  if (onClick) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        onClick={() => onClick(member)}
        className={`${CARD_BASE_CLASS_NAME} ${INTERACTIVE_CARD_CLASS_NAME}`}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className={`${CARD_BASE_CLASS_NAME} ${STATIC_CARD_CLASS_NAME}`}
    >
      {content}
    </motion.div>
  );
}
