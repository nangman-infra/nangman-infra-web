"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Member } from "@/types/member";
import {
  ANIMATION_DURATION_SHORT,
  ANIMATION_DELAY_MEMBER_CARD_INCREMENT,
  MAX_DISPLAY_ACHIEVEMENTS,
  MAX_DISPLAY_CERTIFICATIONS,
} from "@/constants/members";

interface MemberCardProps {
  member: Member;
  index: number;
  baseDelay: number;
  isSenior?: boolean;
  onClick?: (member: Member) => void;
}

export function MemberCard({
  member,
  index,
  baseDelay,
  isSenior = false,
  onClick,
}: MemberCardProps) {
  const certificationCount = member.certifications?.length ?? 0;
  const achievementCount = member.achievements?.length ?? 0;
  const hasCertifications = certificationCount > 0;
  const hasAchievements = achievementCount > 0;

  const handleClick = () => {
    if (onClick) {
      onClick(member);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_DURATION_SHORT, delay: baseDelay + index * ANIMATION_DELAY_MEMBER_CARD_INCREMENT }}
      className="h-full"
    >
      <div
        onClick={handleClick}
        className="gpu-accelerated-blur group relative h-full p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 cursor-pointer flex flex-col"
      >
        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex h-full flex-col gap-4">
          {/* Profile Image & Basic Info */}
          <div className="flex items-start gap-4">
            <div
              className={`relative shrink-0 ${isSenior
                  ? "w-20 h-20 md:w-24 md:h-24"
                  : "w-16 h-16"
                }`}
            >
              {member.profileImage ? (
                <Image
                  src={member.profileImage}
                  alt={member.name}
                  fill
                  sizes={isSenior ? "96px" : "64px"}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors text-lg md:text-xl lg:text-2xl">
                  {member.name[0]}
                </div>
              )}
            </div>
            <div className={`flex-1 min-w-0 ${isSenior ? "pt-1" : ""}`}>
              <h3
                className={`font-semibold mb-1 ${isSenior ? "text-xl md:text-2xl" : "text-lg"
                  }`}
              >
                {member.name}
              </h3>
              <p className="text-muted-foreground text-sm font-mono mb-1">
                {member.role}
              </p>
              {member.affiliation && (
                <p
                  className={`text-xs text-muted-foreground/70 mb-2 ${isSenior ? "" : "text-muted-foreground/80"
                    }`}
                >
                  {member.affiliation}
                </p>
              )}
              {member.experience && (
                <p className="text-xs text-muted-foreground/80">
                  {member.experience}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {member.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {member.bio}
            </p>
          )}

          {/* Specialties */}
          {member.specialties && member.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {member.specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary font-mono ${isSenior ? "px-3 py-1" : ""
                    }`}
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          {/* Certifications - 기본 우선 표시 */}
          {hasCertifications && member.certifications && (
            <div className="pt-2 border-t border-border/20 mt-auto">
              <div className={`grid grid-cols-1 ${isSenior ? "gap-2" : "gap-1.5"}`}>
                {member.certifications.slice(0, MAX_DISPLAY_CERTIFICATIONS).map((cert, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span
                      className={`rounded-full bg-primary/60 shrink-0 ${isSenior ? "w-1.5 h-1.5" : "w-1 h-1"
                        }`}
                    />
                    <span>{cert.name}</span>
                  </div>
                ))}
                {certificationCount > MAX_DISPLAY_CERTIFICATIONS && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <span className={`rounded-full bg-primary/40 shrink-0 ${isSenior ? "w-1.5 h-1.5" : "w-1 h-1"}`} />
                    <span>외 {certificationCount - MAX_DISPLAY_CERTIFICATIONS}개</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Achievements - certifications가 없을 때 표시 */}
          {!hasCertifications && hasAchievements && member.achievements && (
            <div className="pt-2 border-t border-border/20 mt-auto">
              <div className={`grid grid-cols-1 ${isSenior ? "gap-2" : "gap-1.5"}`}>
                {member.achievements.slice(0, MAX_DISPLAY_ACHIEVEMENTS).map((achievement, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span
                      className={`rounded-full bg-primary/60 shrink-0 ${isSenior ? "w-1.5 h-1.5" : "w-1 h-1"
                        }`}
                    />
                    <span>{achievement}</span>
                  </div>
                ))}
                {achievementCount > MAX_DISPLAY_ACHIEVEMENTS && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <span className={`rounded-full bg-primary/40 shrink-0 ${isSenior ? "w-1.5 h-1.5" : "w-1 h-1"}`} />
                    <span>외 {achievementCount - MAX_DISPLAY_ACHIEVEMENTS}개</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
