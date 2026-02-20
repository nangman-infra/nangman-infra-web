"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
  Loader2,
  Globe,
  BookOpen,
  X,
} from "lucide-react";
import type { Member } from "@/types/member";

interface ProfileModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

const PORTFOLIO_DOWNLOAD_DURATION_TEXT = "약 30초~1분";
const PORTFOLIO_SLOW_HINT_DELAY_MS = 10000;

function hasAsciiIdentifier(value: string): boolean {
  return /[a-z0-9]/i.test(value);
}

function extractDomainAlias(value?: string): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    const [subdomain] = parsed.hostname.split(".");
    if (!subdomain || subdomain === "www") {
      return null;
    }

    return subdomain.trim();
  } catch {
    return null;
  }
}

function extractResumeAlias(value?: string): string | null {
  if (!value) {
    return null;
  }

  const fileName = value.split("/").pop()?.trim();
  if (!fileName) {
    return null;
  }

  const baseName = fileName.replace(/\.[^.]+$/, "");
  if (!baseName) {
    return null;
  }

  return baseName.replace(/-(resume|cv)$/i, "").trim();
}

function getPreferredMemberIdentifier(member: Member): string {
  const primary = (member.slug?.trim() || member.name.trim()).trim();

  if (hasAsciiIdentifier(primary)) {
    return primary;
  }

  const homepageAlias = extractDomainAlias(member.links?.homepage);
  if (homepageAlias && hasAsciiIdentifier(homepageAlias)) {
    return homepageAlias;
  }

  const resumeAlias = extractResumeAlias(member.links?.resume);
  if (resumeAlias && hasAsciiIdentifier(resumeAlias)) {
    return resumeAlias;
  }

  return primary;
}

function toSafeFileName(value: string): string {
  const safe = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safe || "member";
}

function resolveFileNameFromDisposition(
  contentDisposition: string | null,
  fallback: string,
): string {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).trim() || fallback;
    } catch {
      return utf8Match[1].trim() || fallback;
    }
  }

  const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1].trim() || fallback;
  }

  return fallback;
}

async function resolveErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
  } catch {
    // ignore parse error and use fallback message
  }

  return "포트폴리오 PDF 다운로드에 실패했습니다.";
}

export function ProfileModal({ member, isOpen, onClose }: ProfileModalProps) {
  const [isDownloadingPortfolio, setIsDownloadingPortfolio] = useState(false);
  const [downloadStatusMessage, setDownloadStatusMessage] = useState<string | null>(null);
  const [downloadErrorMessage, setDownloadErrorMessage] = useState<string | null>(null);
  const [showSlowGenerationHint, setShowSlowGenerationHint] = useState(false);
  const slowHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memberSlug = member?.slug ?? "";
  const memberName = member?.name ?? "";

  useEffect(() => {
    setIsDownloadingPortfolio(false);
    setShowSlowGenerationHint(false);
    setDownloadStatusMessage(null);
    setDownloadErrorMessage(null);

    if (slowHintTimerRef.current) {
      clearTimeout(slowHintTimerRef.current);
      slowHintTimerRef.current = null;
    }
  }, [memberSlug, memberName, isOpen]);

  useEffect(() => {
    return () => {
      if (slowHintTimerRef.current) {
        clearTimeout(slowHintTimerRef.current);
        slowHintTimerRef.current = null;
      }
    };
  }, []);

  if (!member) return null;

  const preferredIdentifier = getPreferredMemberIdentifier(member);
  const memberIdentifier = encodeURIComponent(preferredIdentifier);
  const portfolioDownloadUrl = `/api/members/${memberIdentifier}/portfolio/pdf`;
  const portfolioFallbackFileName = `${toSafeFileName(preferredIdentifier)}-portfolio.pdf`;
  const canDownloadPortfolio = true;
  const hasLinkSection = Boolean(
    member.links?.homepage || member.links?.blog || member.links?.resume || canDownloadPortfolio,
  );

  const handlePortfolioDownload = async () => {
    if (isDownloadingPortfolio) {
      return;
    }

    setIsDownloadingPortfolio(true);
    setDownloadErrorMessage(null);
    setDownloadStatusMessage(
      `포트폴리오 PDF를 생성하고 있습니다. ${PORTFOLIO_DOWNLOAD_DURATION_TEXT} 정도 소요될 수 있습니다.`,
    );
    setShowSlowGenerationHint(false);

    slowHintTimerRef.current = setTimeout(() => {
      setShowSlowGenerationHint(true);
    }, PORTFOLIO_SLOW_HINT_DELAY_MS);

    try {
      const response = await fetch(portfolioDownloadUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const message = await resolveErrorMessage(response);
        throw new Error(message);
      }

      const blob = await response.blob();
      const fileName = resolveFileNameFromDisposition(
        response.headers.get("content-disposition"),
        portfolioFallbackFileName,
      );

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      setDownloadStatusMessage("포트폴리오 PDF 다운로드를 시작했습니다.");
      setShowSlowGenerationHint(false);
    } catch (error) {
      setDownloadErrorMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : "포트폴리오 PDF 다운로드에 실패했습니다.",
      );
      setDownloadStatusMessage(null);
      setShowSlowGenerationHint(false);
    } finally {
      if (slowHintTimerRef.current) {
        clearTimeout(slowHintTimerRef.current);
        slowHintTimerRef.current = null;
      }
      setIsDownloadingPortfolio(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl lg:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 pt-6 pb-4 sm:px-6 lg:px-8 border-b border-border/30 sticky top-0 bg-background z-10 flex flex-row items-center justify-between">
          <DialogTitle className="sr-only">{member.name} 프로필</DialogTitle>
          <DialogClose
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">닫기</span>
          </DialogClose>
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
                  <span className="wrap-break-word">{member.affiliation}</span>
                </div>
              )}
              {member.experience && (
                <p className="text-sm text-muted-foreground/80 wrap-break-word mb-3">
                  {member.experience}
                </p>
              )}

              {/* Links Section */}
              {hasLinkSection && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/20">
                  {member.links?.homepage && (
                    <a
                      href={member.links?.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary hover:bg-primary/20 hover:border-primary/30 transition-all"
                    >
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>홈페이지</span>
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                    </a>
                  )}
                  {member.links?.blog && (
                    <a
                      href={member.links?.blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary hover:bg-primary/20 hover:border-primary/30 transition-all"
                    >
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>블로그</span>
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handlePortfolioDownload}
                    disabled={isDownloadingPortfolio}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDownloadingPortfolio ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span>
                      {isDownloadingPortfolio ? "PDF 생성 중..." : "포트폴리오 PDF"}
                    </span>
                  </button>
                </div>
              )}
              {canDownloadPortfolio && (downloadStatusMessage || downloadErrorMessage || showSlowGenerationHint) && (
                <div className="mt-2 space-y-1" aria-live="polite">
                  {downloadStatusMessage && !downloadErrorMessage && (
                    <p className="text-xs text-muted-foreground">{downloadStatusMessage}</p>
                  )}
                  {showSlowGenerationHint && isDownloadingPortfolio && (
                    <p className="text-xs text-muted-foreground/80">
                      문서를 준비하고 있습니다. 네트워크 상태에 따라 {PORTFOLIO_DOWNLOAD_DURATION_TEXT} 정도 소요될 수 있습니다.
                    </p>
                  )}
                  {downloadErrorMessage && (
                    <p className="text-xs text-red-500">{downloadErrorMessage}</p>
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
                        <p className="font-semibold text-sm sm:text-base wrap-break-word">{edu.university}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground wrap-break-word">
                          {edu.degree} • {edu.major}
                        </p>
                        {edu.lab && (
                          <p className="text-xs text-muted-foreground/70 mt-1 wrap-break-word">
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
                        <p className="text-xs sm:text-sm text-muted-foreground wrap-break-word">{edu.thesis}</p>
                      </div>
                    )}

                    {/* Description */}
                    {edu.description && (
                      <div className="mb-3">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed wrap-break-word">
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
                              <p className="text-muted-foreground wrap-break-word">{paper.title}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-muted-foreground/70">{paper.type}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span className="text-muted-foreground/70 font-mono">{paper.date}</span>
                                {paper.authors && (
                                  <>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span className="text-muted-foreground/70 wrap-break-word">{paper.authors}</span>
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
                        <p className="font-semibold text-base sm:text-lg wrap-break-word">{exp.company}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 wrap-break-word">
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
                          <span className="wrap-break-word">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Achievements Section */}
          {member.achievements && member.achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="space-y-3"
            >
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                주요 성과 ({member.achievements.length}개)
              </h3>
              <div className="space-y-2 sm:space-y-2.5">
                {member.achievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground p-2.5 sm:p-3 rounded-lg bg-card/50 border border-border/20 hover:bg-card/70 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="wrap-break-word">{achievement}</span>
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
                    <p className="font-medium text-xs sm:text-sm mb-1 wrap-break-word">{cert.name}</p>
                    <p className="text-xs text-muted-foreground wrap-break-word">{cert.issuer}</p>
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
                        <p className="font-semibold text-sm sm:text-base wrap-break-word">{project.title}</p>
                        {project.industry && (
                          <span className="text-xs text-primary font-mono mt-1 inline-block px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {project.industry}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 wrap-break-word">
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
                <p className="text-sm sm:text-base text-muted-foreground wrap-break-word">
                  <span className="font-semibold text-primary">
                    {member.mentoring.count}명
                  </span>
                  의 후배들을 멘토링하며 실무 경험과 기술 지식을 공유하고 있습니다.
                </p>
                {member.mentoring.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground/80 mt-2 wrap-break-word">
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
