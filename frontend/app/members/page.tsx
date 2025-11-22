"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Briefcase, GraduationCap, Users } from "lucide-react";

interface Member {
  name: string;
  role: string;
  affiliation?: string;
  category: "senior" | "student";
  achievements?: string[];
  experience?: string;
  bio?: string;
  specialties?: string[];
  profileImage?: string;
}

const members: Member[] = [
  {
    name: "이성원",
    role: "Associate Delivery Consultant, AWS ProServe SDT A2C",
    affiliation: "Amazon Web Services (AWS)",
    category: "senior",
    experience: "2025년 6월 ~ 재직중 • 5년+ 클라우드 및 인프라 경력",
    bio: "인프라를 좋아해서 집을 지어 IDC를 만드는 것이 꿈입니다. 정보통신공학과를 전공하고 모바일융합공학과에서 석사를 마친 후, 현재 AWS 클라우드 환경에서 제조업, 의료, 금융, 서비스, IoT 등 다양한 산업 분야의 고객들에게 AWS 인프라 환경을 구축하고 있습니다.",
    specialties: ["서버", "네트워크", "운영체제", "AWS 인프라", "클라우드 아키텍처"],
    achievements: [
      "9개 AWS 자격증 보유",
      "50+ 프로젝트 완료",
      "28명 멘토링",
    ],
    profileImage: "/profiles/seongwon.png",
  },
  {
    name: "손준호",
    role: "에퀴닉스 데이터센터 엔지니어",
    category: "senior",
  },
  {
    name: "임동건",
    role: "3학년 컴퓨터공학과",
    affiliation: "국립한밭대학교",
    category: "student",
  },
  {
    name: "정택준",
    role: "3학년 컴퓨터공학과",
    affiliation: "국립한밭대학교",
    category: "student",
  },
  {
    name: "태성우",
    role: "3학년 컴퓨터공학과",
    affiliation: "국립한밭대학교",
    category: "student",
  },
  {
    name: "김주형",
    role: "2학년 모바일융합공학과",
    affiliation: "국립한밭대학교",
    category: "student",
  },
  {
    name: "정희훈",
    role: "2학년 모바일융합공학과",
    affiliation: "국립한밭대학교",
    category: "student",
  },
];

export default function MembersPage() {
  const seniors = members.filter((m) => m.category === "senior");
  const students = members.filter((m) => m.category === "student");

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12 md:space-y-16"
        >
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
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">멘토</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {seniors.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="group relative p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
                  >
                    <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-4">
                      {/* Profile Image & Basic Info */}
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
                          {member.profileImage ? (
                            <Image
                              src={member.profileImage}
                              alt={member.name}
                              fill
                              sizes="96px"
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-2xl md:text-3xl group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                              {member.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h3 className="text-xl md:text-2xl font-semibold mb-1">{member.name}</h3>
                          <p className="text-muted-foreground text-sm font-mono mb-1">{member.role}</p>
                          {member.affiliation && (
                            <p className="text-xs text-muted-foreground/70 mb-2">{member.affiliation}</p>
                          )}
                          {member.experience && (
                            <p className="text-xs text-muted-foreground/80">{member.experience}</p>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {member.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {member.bio}
                        </p>
                      )}

                      {/* Specialties */}
                      {member.specialties && member.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {member.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary font-mono"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Achievements */}
                      {member.achievements && member.achievements.length > 0 && (
                        <div className="pt-2 border-t border-border/20">
                          <div className="grid grid-cols-1 gap-2">
                            {member.achievements.map((achievement, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                <span>{achievement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Students Section */}
          {students.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-6 h-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">학생</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {students.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="group relative p-6 md:p-8 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500"
                  >
                    <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="relative w-16 h-16 shrink-0">
                          {member.profileImage ? (
                            <Image
                              src={member.profileImage}
                              alt={member.name}
                              fill
                              sizes="64px"
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                              {member.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                          <p className="text-muted-foreground text-sm font-mono mb-1">{member.role}</p>
                          {member.affiliation && (
                            <p className="text-xs text-muted-foreground/80">{member.affiliation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8"
          >
            <div className="group relative p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">{members.length}</div>
              <div className="text-sm text-muted-foreground">전체 멤버</div>
            </div>
            <div className="group relative p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
              <Briefcase className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">{seniors.length}</div>
              <div className="text-sm text-muted-foreground">멘토</div>
            </div>
            <div className="group relative p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500 text-center">
              <GraduationCap className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">{students.length}</div>
              <div className="text-sm text-muted-foreground">학생</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
