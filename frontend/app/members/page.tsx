"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import type { Member } from "@/types/member";
import { members } from "@/data/members";
import { ProfileModal } from "@/components/members/ProfileModal";
import { MemberCard } from "@/components/members/MemberCard";
import { StatsSection } from "@/components/members/StatsSection";
import {
  ANIMATION_DELAY_SENIORS_SECTION,
  ANIMATION_DELAY_STUDENTS_SECTION,
  ANIMATION_DELAY_MEMBER_CARD_BASE,
} from "@/constants/members";

export default function MembersPage() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "함께하는 사람들 | Nangman Infra";
  }, []);

  const seniors = members.filter((m) => m.category === "senior");
  const students = members.filter((m) => m.category === "student");

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
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
              인프라를 지탱하는 팀원들을 소개합니다
            </p>
          </div>

          {/* Seniors Section */}
          {seniors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: ANIMATION_DELAY_SENIORS_SECTION }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">멘토</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {seniors.map((member, index) => (
                  <MemberCard
                    key={member.name}
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

          {/* Students Section */}
          {students.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: ANIMATION_DELAY_STUDENTS_SECTION }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-6 h-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">학생</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {students.map((member, index) => (
                  <MemberCard
                    key={member.name}
                    member={member}
                    index={index}
                    baseDelay={ANIMATION_DELAY_MEMBER_CARD_BASE + ANIMATION_DELAY_STUDENTS_SECTION}
                    isSenior={false}
                    onClick={handleMemberClick}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats Section */}
          <StatsSection
            totalMembers={members.length}
            seniorsCount={seniors.length}
            studentsCount={students.length}
          />
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
