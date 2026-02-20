"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
const PORTFOLIO_JOB_POLL_INTERVAL_MS = 2500;
const PORTFOLIO_JOB_MAX_WAIT_MS = 10 * 60 * 1000;
const PORTFOLIO_JOB_STORAGE_KEY = "members:portfolio-job-state:v1";

type PortfolioJobStatus = "queued" | "running" | "completed" | "failed";

interface PortfolioJobResponse {
  jobId: string;
  status: PortfolioJobStatus;
  message: string;
  errorMessage?: string;
}

interface PortfolioJobUiState {
  jobId: string | null;
  status: PortfolioJobStatus | "idle";
  startedAt: number | null;
  statusMessage: string | null;
  errorMessage: string | null;
}

function createEmptyPortfolioJobUiState(): PortfolioJobUiState {
  return {
    jobId: null,
    status: "idle",
    startedAt: null,
    statusMessage: null,
    errorMessage: null,
  };
}

function isPortfolioJobStatus(
  value: unknown,
): value is PortfolioJobStatus | "idle" {
  return (
    value === "idle" ||
    value === "queued" ||
    value === "running" ||
    value === "completed" ||
    value === "failed"
  );
}

function normalizePortfolioJobUiState(value: unknown): PortfolioJobUiState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  const status = source.status;
  if (!isPortfolioJobStatus(status)) {
    return null;
  }

  const jobId = typeof source.jobId === "string" ? source.jobId.trim() || null : null;
  const startedAt =
    typeof source.startedAt === "number" && Number.isFinite(source.startedAt)
      ? source.startedAt
      : null;
  const statusMessage =
    typeof source.statusMessage === "string" ? source.statusMessage : null;
  const errorMessage =
    typeof source.errorMessage === "string" ? source.errorMessage : null;

  return {
    jobId,
    status,
    startedAt,
    statusMessage,
    errorMessage,
  };
}

function readPortfolioJobStateMap(): Record<string, PortfolioJobUiState> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PORTFOLIO_JOB_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const result: Record<string, PortfolioJobUiState> = {};
    for (const [memberKey, memberState] of Object.entries(parsed)) {
      if (!memberKey.trim()) {
        continue;
      }

      const normalized = normalizePortfolioJobUiState(memberState);
      if (!normalized) {
        continue;
      }

      result[memberKey] = normalized;
    }

    return result;
  } catch {
    return {};
  }
}

function shouldPersistPortfolioJobState(state: PortfolioJobUiState): boolean {
  return Boolean(
    state.jobId ||
      state.status !== "idle" ||
      state.statusMessage ||
      state.errorMessage,
  );
}

function normalizePortfolioJobResponse(payload: unknown): PortfolioJobResponse {
  const source =
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data &&
    typeof payload.data === "object"
      ? payload.data
      : payload;

  if (!source || typeof source !== "object") {
    throw new Error("포트폴리오 PDF 작업 응답 형식이 올바르지 않습니다.");
  }

  const sourceRecord = source as Record<string, unknown>;

  const jobId = typeof sourceRecord.jobId === "string" ? sourceRecord.jobId : "";
  const status =
    typeof sourceRecord.status === "string"
      ? (sourceRecord.status as PortfolioJobStatus)
      : "queued";
  const message = typeof sourceRecord.message === "string" ? sourceRecord.message : "";
  const errorMessage =
    typeof sourceRecord.errorMessage === "string"
      ? sourceRecord.errorMessage
      : undefined;

  if (!jobId) {
    throw new Error("포트폴리오 PDF 작업 식별자를 받지 못했습니다.");
  }

  return {
    jobId,
    status,
    message,
    ...(errorMessage ? { errorMessage } : {}),
  };
}

function getProgressHintMessage(elapsedMs: number): string {
  if (elapsedMs < 10000) {
    return "서버에서 작업을 준비하고 있어요.";
  }
  if (elapsedMs < 30000) {
    return "프로필 정보를 수집하고 있어요.";
  }
  if (elapsedMs < 60000) {
    return "문서를 생성하고 있어요.";
  }
  if (elapsedMs < 120000) {
    return "레이아웃을 정리하고 있어요.";
  }
  return "데이터 양이 많아 시간이 더 필요해요. 계속 작업 중입니다.";
}

function composeProgressMessage(baseMessage: string | undefined, elapsedMs: number): string {
  const progressHint = getProgressHintMessage(elapsedMs);
  if (!baseMessage || !baseMessage.trim()) {
    return progressHint;
  }
  return `${baseMessage.trim()} ${progressHint}`.trim();
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
  const [portfolioJobStatus, setPortfolioJobStatus] = useState<PortfolioJobStatus | "idle">(
    "idle",
  );
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [downloadStartedAt, setDownloadStartedAt] = useState<number | null>(null);
  const [isJobStateLoaded, setIsJobStateLoaded] = useState(false);
  const [isDownloadingPortfolio, setIsDownloadingPortfolio] = useState(false);
  const [downloadStatusMessage, setDownloadStatusMessage] = useState<string | null>(null);
  const [downloadErrorMessage, setDownloadErrorMessage] = useState<string | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingCancelledRef = useRef(false);
  const downloadStartedAtRef = useRef<number | null>(null);
  const activeJobIdRef = useRef<string | null>(null);
  const pollPortfolioJobStatusRef = useRef<
    ((jobId: string) => Promise<void>) | null
  >(null);
  const isOpenRef = useRef(isOpen);
  const jobStateByMemberRef = useRef<Record<string, PortfolioJobUiState>>({});
  const currentMemberKeyRef = useRef<string>("");
  const memberJobKey = (member?.slug?.trim() || member?.name?.trim() || "").trim();

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const restored = readPortfolioJobStateMap();
    jobStateByMemberRef.current = restored;
    setIsJobStateLoaded(true);
  }, []);

  useEffect(() => {
    return () => {
      pollingCancelledRef.current = true;
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, []);

  const persistJobStateMap = useCallback(
    (stateMap: Record<string, PortfolioJobUiState>): void => {
      if (typeof window === "undefined") {
        return;
      }

      try {
        window.localStorage.setItem(
          PORTFOLIO_JOB_STORAGE_KEY,
          JSON.stringify(stateMap),
        );
      } catch {
        // ignore storage write failure
      }
    },
    [],
  );

  const snapshotCurrentMemberState = useCallback((): PortfolioJobUiState => {
    return {
      jobId: activeJobId,
      status: portfolioJobStatus,
      startedAt: downloadStartedAt,
      statusMessage: downloadStatusMessage,
      errorMessage: downloadErrorMessage,
    };
  }, [
    activeJobId,
    portfolioJobStatus,
    downloadStartedAt,
    downloadStatusMessage,
    downloadErrorMessage,
  ]);

  const upsertMemberJobState = useCallback(
    (memberKey: string, state: PortfolioJobUiState): void => {
      if (!memberKey) {
        return;
      }

      const nextMap = {
        ...jobStateByMemberRef.current,
      };

      if (shouldPersistPortfolioJobState(state)) {
        nextMap[memberKey] = state;
      } else {
        delete nextMap[memberKey];
      }

      jobStateByMemberRef.current = nextMap;
      persistJobStateMap(nextMap);
    },
    [persistJobStateMap],
  );

  const applyMemberState = useCallback((state: PortfolioJobUiState): void => {
    activeJobIdRef.current = state.jobId;
    setActiveJobId(state.jobId);
    downloadStartedAtRef.current = state.startedAt;
    setDownloadStartedAt(state.startedAt);
    setPortfolioJobStatus(state.status);
    setDownloadStatusMessage(state.statusMessage);
    setDownloadErrorMessage(state.errorMessage);
    setIsDownloadingPortfolio(
      Boolean(
        state.jobId && (state.status === "queued" || state.status === "running"),
      ),
    );
  }, []);

  useEffect(() => {
    if (!isJobStateLoaded) {
      return;
    }

    const previousMemberKey = currentMemberKeyRef.current;
    if (previousMemberKey) {
      upsertMemberJobState(previousMemberKey, snapshotCurrentMemberState());
    }

    pollingCancelledRef.current = true;
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }

    currentMemberKeyRef.current = memberJobKey;
    if (!memberJobKey) {
      applyMemberState(createEmptyPortfolioJobUiState());
      return;
    }

    const savedState =
      jobStateByMemberRef.current[memberJobKey] ||
      createEmptyPortfolioJobUiState();
    applyMemberState(savedState);

    if (
      savedState.jobId &&
      (savedState.status === "queued" || savedState.status === "running")
    ) {
      pollingCancelledRef.current = false;
      if (!downloadStartedAtRef.current) {
        const now = Date.now();
        downloadStartedAtRef.current = now;
        setDownloadStartedAt(now);
      }
      void pollPortfolioJobStatusRef.current?.(savedState.jobId);
    }
  }, [
    isJobStateLoaded,
    memberJobKey,
    applyMemberState,
    snapshotCurrentMemberState,
    upsertMemberJobState,
  ]);

  useEffect(() => {
    if (!isJobStateLoaded) {
      return;
    }

    const currentMemberKey = currentMemberKeyRef.current;
    if (!currentMemberKey) {
      return;
    }

    upsertMemberJobState(currentMemberKey, snapshotCurrentMemberState());
  }, [
    isJobStateLoaded,
    memberJobKey,
    activeJobId,
    portfolioJobStatus,
    downloadStartedAt,
    downloadStatusMessage,
    downloadErrorMessage,
    snapshotCurrentMemberState,
    upsertMemberJobState,
  ]);

  if (!member) return null;

  const memberIdentifierSource = (member.slug?.trim() || member.name.trim()).trim();
  const memberIdentifier = encodeURIComponent(memberIdentifierSource);
  const startPortfolioJobUrl = `/api/members/${memberIdentifier}/portfolio/pdf/jobs`;
  const portfolioFallbackFileName = `${toSafeFileName(memberIdentifierSource)}-portfolio.pdf`;
  const canDownloadPortfolio = true;
  const hasLinkSection = Boolean(
    member.links?.homepage || member.links?.blog || member.links?.resume || canDownloadPortfolio,
  );
  const isPortfolioGenerating =
    portfolioJobStatus === "queued" || portfolioJobStatus === "running";
  const isPortfolioButtonDisabled = isPortfolioGenerating || isDownloadingPortfolio;
  const portfolioButtonLabel = isDownloadingPortfolio
    ? portfolioJobStatus === "completed"
      ? "PDF 다운로드 중..."
      : "PDF 생성 중..."
    : portfolioJobStatus === "completed"
      ? "포트폴리오 PDF 다운로드"
      : "포트폴리오 PDF";

  const downloadPortfolioByJobId = async (jobId: string): Promise<void> => {
    const response = await fetch(`/api/members/portfolio/pdf/jobs/${encodeURIComponent(jobId)}/download`, {
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
  };

  async function handleCompletedPortfolioJob(
    jobId: string,
    mode: "auto" | "manual",
  ): Promise<void> {
    pollingCancelledRef.current = true;
    setPortfolioJobStatus("completed");

    if (mode === "auto" && !isOpenRef.current) {
      setDownloadStatusMessage(
        "포트폴리오 PDF가 준비되었습니다. 모달에서 버튼을 눌러 다운로드하세요.",
      );
      setDownloadErrorMessage(null);
      setIsDownloadingPortfolio(false);
      return;
    }

    setIsDownloadingPortfolio(true);
    setDownloadStatusMessage(
      mode === "auto"
        ? "포트폴리오 PDF가 준비되어 다운로드를 시작합니다."
        : "준비된 포트폴리오 PDF를 다운로드합니다.",
    );
    setDownloadErrorMessage(null);

    try {
      await downloadPortfolioByJobId(jobId);
      setDownloadStatusMessage("포트폴리오 PDF 다운로드를 시작했습니다.");
      setDownloadErrorMessage(null);
    } catch (error) {
      setDownloadErrorMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : "포트폴리오 PDF 다운로드에 실패했습니다.",
      );
      setDownloadStatusMessage(
        "포트폴리오 PDF가 준비되었습니다. 버튼을 눌러 다시 다운로드하세요.",
      );
    } finally {
      setIsDownloadingPortfolio(false);
    }
  }

  async function pollPortfolioJobStatus(jobId: string): Promise<void> {
    if (pollingCancelledRef.current) {
      return;
    }

    const startedAt = downloadStartedAtRef.current ?? downloadStartedAt ?? Date.now();
    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs > PORTFOLIO_JOB_MAX_WAIT_MS) {
      pollingCancelledRef.current = true;
      setPortfolioJobStatus("failed");
      setDownloadErrorMessage(
        "포트폴리오 PDF 생성 시간이 길어지고 있습니다. 잠시 후 다시 시도해주세요.",
      );
      setDownloadStatusMessage(null);
      setIsDownloadingPortfolio(false);
      return;
    }

    try {
      const response = await fetch(`/api/members/portfolio/pdf/jobs/${encodeURIComponent(jobId)}`, {
        method: "GET",
        cache: "no-store",
      });

      if (pollingCancelledRef.current) {
        return;
      }

      if (!response.ok) {
        const message = await resolveErrorMessage(response);
        throw new Error(message);
      }

      const data = normalizePortfolioJobResponse(await response.json());
      if (pollingCancelledRef.current) {
        return;
      }
      if (data.status === "completed") {
        setPortfolioJobStatus("completed");
        await handleCompletedPortfolioJob(jobId, "auto");
        return;
      }

      if (data.status === "failed") {
        pollingCancelledRef.current = true;
        setPortfolioJobStatus("failed");
        throw new Error(data.errorMessage || data.message || "포트폴리오 PDF 생성에 실패했습니다.");
      }

      setPortfolioJobStatus(data.status);
      setDownloadStatusMessage(composeProgressMessage(data.message, elapsedMs));
      setDownloadErrorMessage(null);
      pollingTimerRef.current = setTimeout(() => {
        void pollPortfolioJobStatus(jobId);
      }, PORTFOLIO_JOB_POLL_INTERVAL_MS);
    } catch (error) {
      pollingCancelledRef.current = true;
      setPortfolioJobStatus("failed");
      setDownloadErrorMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : "포트폴리오 PDF 다운로드에 실패했습니다.",
      );
      setDownloadStatusMessage(null);
      setIsDownloadingPortfolio(false);
    }
  }

  pollPortfolioJobStatusRef.current = pollPortfolioJobStatus;

  const handlePortfolioDownload = async () => {
    if (isDownloadingPortfolio) {
      return;
    }

    if (portfolioJobStatus === "completed" && activeJobId) {
      await handleCompletedPortfolioJob(activeJobId, "manual");
      return;
    }

    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    pollingCancelledRef.current = false;
    const startedAt = Date.now();
    downloadStartedAtRef.current = startedAt;
    setDownloadStartedAt(startedAt);
    activeJobIdRef.current = null;
    setActiveJobId(null);
    setPortfolioJobStatus("queued");
    setIsDownloadingPortfolio(true);
    setDownloadErrorMessage(null);
    setDownloadStatusMessage(
      `포트폴리오 PDF 생성 작업을 시작합니다. ${PORTFOLIO_DOWNLOAD_DURATION_TEXT} 정도 소요될 수 있습니다.`,
    );

    try {
      const response = await fetch(startPortfolioJobUrl, {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        const message = await resolveErrorMessage(response);
        throw new Error(message);
      }

      const payload = normalizePortfolioJobResponse(await response.json());
      activeJobIdRef.current = payload.jobId;
      setActiveJobId(payload.jobId);
      setPortfolioJobStatus(payload.status);

      const elapsedMs = Date.now() - (downloadStartedAtRef.current ?? Date.now());
      setDownloadStatusMessage(composeProgressMessage(payload.message, elapsedMs));
      setDownloadErrorMessage(null);

      if (payload.status === "failed") {
        pollingCancelledRef.current = true;
        setPortfolioJobStatus("failed");
        setIsDownloadingPortfolio(false);
        throw new Error(payload.errorMessage || payload.message || "포트폴리오 PDF 생성에 실패했습니다.");
      }

      if (payload.status === "completed") {
        await handleCompletedPortfolioJob(payload.jobId, "auto");
        return;
      }

      void pollPortfolioJobStatus(payload.jobId);
    } catch (error) {
      pollingCancelledRef.current = true;
      setPortfolioJobStatus("failed");
      setDownloadErrorMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : "포트폴리오 PDF 다운로드에 실패했습니다.",
      );
      setDownloadStatusMessage(null);
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
                    disabled={isPortfolioButtonDisabled}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPortfolioButtonDisabled ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span>{portfolioButtonLabel}</span>
                  </button>
                </div>
              )}
              {canDownloadPortfolio && (downloadStatusMessage || downloadErrorMessage) && (
                <div className="mt-2 space-y-1" role="status" aria-live="polite" aria-atomic="true">
                  {downloadStatusMessage && !downloadErrorMessage && (
                    <p className="text-xs text-muted-foreground">{downloadStatusMessage}</p>
                  )}
                  {isPortfolioGenerating && (
                    <p className="text-xs text-muted-foreground/80">
                      창을 닫아도 서버에서 작업은 계속 진행됩니다.
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
