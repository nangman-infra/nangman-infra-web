"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Award,
  Code,
  GraduationCap,
  Building2,
  FileText,
  Users,
  ExternalLink,
  Download,
  Globe,
  BookOpen,
} from "lucide-react";
import type { Member } from "@/types/member";

interface ProfileModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ member, isOpen, onClose }: ProfileModalProps) {
  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl lg:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 pt-6 pb-4 sm:px-6 lg:px-8 border-b border-border/30 sticky top-0 bg-background z-10">
          <DialogTitle className="sr-only">{member.name} 프로필</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-4 pt-6 pb-6 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-border/30">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 shrink-0">
              {member.profileImage ? (
                <Image
                  src={member.profileImage}
                  alt={member.name}
                  fill
                  sizes="128px"
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-4xl">
                  {member.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{member.name}</h2>
              <p className="text-base sm:text-lg text-muted-foreground font-mono mb-2">
                {member.role}
              </p>
              {member.affiliation && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span className="break-words">{member.affiliation}</span>
                </div>
              )}
              {member.experience && (
                <p className="text-sm text-muted-foreground/80 break-words mb-3">
                  {member.experience}
                </p>
              )}

              {/* Links Section */}
              {member.links && (member.links.blog || member.links.homepage || member.links.resume) && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/20">
                  {member.links.homepage && (
                    <a
                      href={member.links.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary hover:bg-primary/20 hover:border-primary/30 transition-all"
                    >
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>홈페이지</span>
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                    </a>
                  )}
                  {member.links.blog && (
                    <a
                      href={member.links.blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary hover:bg-primary/20 hover:border-primary/30 transition-all"
                    >
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>블로그</span>
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                    </a>
                  )}
                  {member.links.resume && (
                    <div className="relative group">
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/50 text-primary-foreground/70 text-xs sm:text-sm cursor-not-allowed opacity-60 transition-all"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>이력서 다운로드</span>
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-muted-foreground bg-background border border-border/30 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                        서비스 준비중입니다
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-background border-r border-b border-border/30 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {member.bio && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-2"
            >
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-primary rounded-full shrink-0" />
                소개
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {member.bio}
              </p>
            </motion.div>
          )}

          {/* Specialties Section */}
          {member.specialties && member.specialties.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Code className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                전문 분야
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {member.specialties.map((specialty, idx) => (
                  <span
                    key={idx}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary font-mono"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Education Section */}
          {member.education && member.education.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-3"
            >
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                학력
              </h3>
              <div className="space-y-4 sm:space-y-5">
                {member.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 rounded-lg bg-card/50 border border-border/20 hover:bg-card/70 transition-colors"
                  >
                    {/* University and Degree */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base break-words">{edu.university}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                          {edu.degree} • {edu.major}
                        </p>
                        {edu.lab && (
                          <p className="text-xs text-muted-foreground/70 mt-1 break-words">
                            {edu.lab}
                          </p>
                        )}
                      </div>
                      {edu.period && (
                        <span className="text-xs text-muted-foreground/70 font-mono whitespace-nowrap sm:ml-4">
                          {edu.period}
                        </span>
                      )}
                    </div>

                    {/* Thesis */}
                    {edu.thesis && (
                      <div className="mb-3 pb-3 border-b border-border/10">
                        <p className="text-xs text-muted-foreground/70 mb-1">졸업논문</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{edu.thesis}</p>
                      </div>
                    )}

                    {/* Description */}
                    {edu.description && (
                      <div className="mb-3">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                          {edu.description}
                        </p>
                      </div>
                    )}

                    {/* Papers */}
                    {edu.papers && edu.papers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/10">
                        <p className="text-xs text-muted-foreground/70 mb-2">논문 및 연구 활동</p>
                        <div className="space-y-2">
                          {edu.papers.map((paper, paperIdx) => (
                            <div key={paperIdx} className="text-xs sm:text-sm">
                              <p className="text-muted-foreground break-words">{paper.title}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-muted-foreground/70">{paper.type}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span className="text-muted-foreground/70 font-mono">{paper.date}</span>
                                {paper.authors && (
                                  <>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span className="text-muted-foreground/70 break-words">{paper.authors}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Work Experience Section */}
          {member.workExperience && member.workExperience.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-3"
            >
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                경력 사항
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {member.workExperience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 rounded-lg bg-card/50 border border-border/20 hover:bg-card/70 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base sm:text-lg break-words">{exp.company}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                          {exp.position}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground/70 font-mono whitespace-nowrap sm:ml-4">
                        {exp.period}
                      </span>
                    </div>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {exp.description.map((desc, descIdx) => (
                        <li
                          key={descIdx}
                          className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="break-words">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Certifications Section */}
          {member.certifications && member.certifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="space-y-3"
            >
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                자격증 및 인증 ({member.certifications.length}개)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {member.certifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-lg bg-card/50 border border-border/20 hover:bg-card/70 transition-colors"
                  >
                    <p className="font-medium text-xs sm:text-sm mb-1 break-words">{cert.name}</p>
                    <p className="text-xs text-muted-foreground break-words">{cert.issuer}</p>
                    {cert.date && (
                      <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                        {cert.date}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Projects Section */}
          {member.projects && member.projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="space-y-3"
            >
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                주요 프로젝트 ({member.projects.length}개)
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {member.projects.map((project, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 rounded-lg bg-card/50 border border-border/20 hover:bg-card/70 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base break-words">{project.title}</p>
                        {project.industry && (
                          <span className="text-xs text-primary font-mono mt-1 inline-block px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {project.industry}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 break-words">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {project.technologies.map((tech, techIdx) => (
                        <span
                          key={techIdx}
                          className="px-2 py-0.5 sm:py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Technical Skills Section - 비활성화 */}
          {/* 기술 스택 섹션 재활성화 시 아래 주석 해제
          {member.technicalSkills && member.technicalSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="space-y-3"
            >
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Code className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                기술 스택
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {member.technicalSkills.map((skillGroup, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 rounded-lg bg-card/50 border border-border/20"
                  >
                    <p className="font-semibold text-sm mb-2">{skillGroup.category}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {skillGroup.skills.map((skill, skillIdx) => (
                        <span
                          key={skillIdx}
                          className="px-2 py-0.5 sm:py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          */}

          {/* Mentoring Section */}
          {member.mentoring && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="space-y-3"
            >
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                멘토링
              </h3>
              <div className="p-3 sm:p-4 rounded-lg bg-card/50 border border-border/20">
                <p className="text-sm sm:text-base text-muted-foreground break-words">
                  <span className="font-semibold text-primary">
                    {member.mentoring.count}명
                  </span>
                  의 후배들을 멘토링하며 실무 경험과 기술 지식을 공유하고 있습니다.
                </p>
                {member.mentoring.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground/80 mt-2 break-words">
                    {member.mentoring.description}
                  </p>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

