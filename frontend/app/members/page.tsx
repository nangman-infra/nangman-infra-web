"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import type { Member } from "@/types/member";
import { members } from "@/data/members";
import { getMembersUseCase } from "@/lib/application/use-cases/members/get-members";
import { ProfileModal } from "@/components/members/ProfileModal";
import { MemberCard } from "@/components/members/MemberCard";
import { StatsSection } from "@/components/members/StatsSection";
import {
  ANIMATION_DELAY_SENIORS_SECTION,
  ANIMATION_DELAY_MENTEES_SECTION,
  ANIMATION_DELAY_MEMBER_CARD_BASE,
  ANIMATION_DURATION_MEDIUM,
} from "@/constants/members";

export default function MembersPage() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [membersData, setMembersData] = useState<Member[] | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

  useEffect(() => {
    document.title = "함께하는 사람들 | Nangman Infra";

    let isMounted = true;

    const loadMembers = async () => {
      try {
        const payload = await getMembersUseCase({ fallback: [] });
        if (!isMounted) {
          return;
        }

        if (payload.length > 0) {
          setMembersData(payload);
          setIsUsingFallbackData(false);
          return;
        }

        setMembersData(members);
        setIsUsingFallbackData(true);
      } catch {
        if (!isMounted) {
          return;
        }

        setMembersData(members);
        setIsUsingFallbackData(true);
      }
    };

    void loadMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  const isLoadingMembers = membersData === null;
  const resolvedMembers = membersData ?? [];
  const seniors = resolvedMembers.filter((m) => m.category === "senior");
  const mentees = resolvedMembers.filter((m) => m.category === "mentee");

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const getMemberKey = (
    member: Pick<Member, "slug" | "name">,
    section: "senior" | "mentee",
    index: number,
  ) => {
    const slug = member.slug?.trim();
    if (slug) {
      return `${section}-${slug}`;
    }

    return `${section}-${member.name}-${index}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="relative max-w-7xl mx-auto">
        <div className="space-y-12 md:space-y-16">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              함께하는 사람들
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              인프라를 지탱하는 커뮤니티 구성원을 소개합니다
            </p>
            {isUsingFallbackData && (
              <p className="text-xs text-muted-foreground/80 mt-2">
                실시간 멤버 정보를 불러오지 못해 로컬 정보를 표시하고 있습니다.
              </p>
            )}
          </div>

          {isLoadingMembers ? (
            <>
              <div className="space-y-6">
                <div className="h-8 w-24 rounded bg-muted/30 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 md:auto-rows-fr gap-6 md:gap-8">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div
                      key={`senior-skeleton-${idx}`}
                      className="h-[280px] rounded-xl border border-border/30 bg-card/20 animate-pulse"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 w-24 rounded bg-muted/30 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:auto-rows-fr gap-6 md:gap-8">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={`mentee-skeleton-${idx}`}
                      className="h-[260px] rounded-xl border border-border/30 bg-card/20 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Seniors Section */}
              {seniors.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION_DURATION_MEDIUM, delay: ANIMATION_DELAY_SENIORS_SECTION }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">멘토</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 md:auto-rows-fr gap-6 md:gap-8">
                {seniors.map((member, index) => (
                  <MemberCard
                    key={getMemberKey(member, "senior", index)}
                    member={member}
                    index={index}
                    baseDelay={ANIMATION_DELAY_MEMBER_CARD_BASE}
                    isSenior
                    onClick={handleMemberClick}
                  />
                ))}
              </div>
      </motion.div>
              )}

              {/* Mentees Section */}
              {mentees.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: ANIMATION_DURATION_MEDIUM, delay: ANIMATION_DELAY_MENTEES_SECTION }}
                  className="space-y-6"
              >
                  <div className="flex items-center gap-3 mb-6">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl md:text-3xl font-bold">멘티</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:auto-rows-fr gap-6 md:gap-8">
                    {mentees.map((member, index) => (
                      <MemberCard
                        key={getMemberKey(member, "mentee", index)}
                        member={member}
                        index={index}
                        baseDelay={ANIMATION_DELAY_MEMBER_CARD_BASE + ANIMATION_DELAY_MENTEES_SECTION}
                        isSenior={false}
                        onClick={handleMemberClick}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {!isLoadingMembers && (
            <StatsSection
              totalMembers={resolvedMembers.length}
              seniorsCount={seniors.length}
              menteesCount={mentees.length}
            />
          )}
            </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
