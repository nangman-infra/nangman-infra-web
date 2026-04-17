"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
import { MemberAvatar } from "@/components/members/MemberAvatar";

type ProfileModalProps = Readonly<{
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}>;

const PORTFOLIO_JOB_POLL_INTERVAL_MS = 2500;
const PORTFOLIO_JOB_MAX_WAIT_MS = 10 * 60 * 1000;
const PORTFOLIO_JOB_STORAGE_KEY = "members:portfolio-job-state:v2";

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

class PortfolioJobRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PortfolioJobRequestError";
    this.status = status;
  }
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
  if (globalThis.window === undefined) {
    return {};
  }

  try {
    const raw = globalThis.localStorage.getItem(PORTFOLIO_JOB_STORAGE_KEY);
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

function normalizePortfolioJobResponse(
  payload: unknown,
  messages: {
    invalidResponse: string;
    missingJobId: string;
  },
): PortfolioJobResponse {
  const source =
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data &&
    typeof payload.data === "object"
      ? payload.data
      : payload;

  if (!source || typeof source !== "object") {
    throw new Error(messages.invalidResponse);
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
    throw new Error(messages.missingJobId);
  }

  return {
    jobId,
    status,
    message,
    ...(errorMessage ? { errorMessage } : {}),
  };
}

function toSafeFileName(value: string): string {
  const safe = value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9\-_.]/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/(^-)|(-$)/g, "");

  return safe || "member";
}

function resolveFileNameFromDisposition(
  contentDisposition: string | null,
  fallback: string,
): string {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).trim() || fallback;
    } catch {
      return utf8Match[1].trim() || fallback;
    }
  }

  const asciiMatch = /filename="?([^"]+)"?/i.exec(contentDisposition);
  if (asciiMatch?.[1]) {
    return asciiMatch[1].trim() || fallback;
  }

  return fallback;
}

async function resolveErrorMessage(
  response: Response,
  fallbackMessage: string,
  options?: { exposeBackendMessage?: boolean },
): Promise<string> {
  if (options?.exposeBackendMessage) {
    try {
      const data = (await response.json()) as { message?: string };
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message.trim();
      }
    } catch {
      // ignore parse error and use fallback message
    }
  }

  return fallbackMessage;
}

export function ProfileModal({ member, isOpen, onClose }: ProfileModalProps) {
  const t = useTranslations("ProfileModal");
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
  const staleJobRecoveryAttemptedRef = useRef(false);
  const jobStateByMemberRef = useRef<Record<string, PortfolioJobUiState>>({});
  const currentMemberKeyRef = useRef<string>("");
  const memberJobKey = (member?.slug?.trim() || member?.name?.trim() || "").trim();
  const copy = useMemo(
    () => ({
      downloadDuration: t("downloadDuration"),
      staleJobMessage: t("staleJobMessage"),
      staleJobRetryMessage: t("staleJobRetryMessage"),
      invalidResponse: t("invalidResponse"),
      missingJobId: t("missingJobId"),
      downloadFailed: t("downloadFailed"),
      jobFailed: t("jobFailed"),
      buttonIdle: t("buttonIdle"),
      buttonDownloading: t("buttonDownloading"),
      buttonGenerating: t("buttonGenerating"),
      buttonCompleted: t("buttonCompleted"),
      autoReady: t("autoReady"),
      autoDownloading: t("autoDownloading"),
      manualDownloading: t("manualDownloading"),
      downloadStarted: t("downloadStarted"),
      manualRetryReady: t("manualRetryReady"),
      waitTooLong: t("waitTooLong"),
      keepRunningHint: t("keepRunningHint"),
      statusStarting: t("statusStarting"),
      progressPreparing: t("progressPreparing"),
      progressCollecting: t("progressCollecting"),
      progressRendering: t("progressRendering"),
      progressLayout: t("progressLayout"),
      progressLongRunning: t("progressLongRunning"),
    }),
    [t],
  );
  const getProgressHintMessage = useCallback(
    (elapsedMs: number): string => {
      if (elapsedMs < 10000) {
        return copy.progressPreparing;
      }
      if (elapsedMs < 30000) {
        return copy.progressCollecting;
      }
      if (elapsedMs < 60000) {
        return copy.progressRendering;
      }
      if (elapsedMs < 120000) {
        return copy.progressLayout;
      }
      return copy.progressLongRunning;
    },
    [copy],
  );
  const composeProgressMessage = useCallback(
    (baseMessage: string | undefined, elapsedMs: number): string => {
      const progressHint = getProgressHintMessage(elapsedMs);
      if (!baseMessage?.trim()) {
        return progressHint;
      }
      return `${baseMessage.trim()} ${progressHint}`.trim();
    },
    [getProgressHintMessage],
  );

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
      if (globalThis.window === undefined) {
        return;
      }

      try {
        globalThis.localStorage.setItem(
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

  const clearCurrentMemberJobState = useCallback(
    (
      options?: {
        statusMessage?: string | null;
        errorMessage?: string | null;
        preserveRecoveryFlag?: boolean;
      },
    ): void => {
      const nextState: PortfolioJobUiState = {
        ...createEmptyPortfolioJobUiState(),
        statusMessage: options?.statusMessage ?? null,
        errorMessage: options?.errorMessage ?? null,
      };

      if (!options?.preserveRecoveryFlag) {
        staleJobRecoveryAttemptedRef.current = false;
      }

      applyMemberState(nextState);

      const currentMemberKey = currentMemberKeyRef.current;
      if (currentMemberKey) {
        upsertMemberJobState(currentMemberKey, nextState);
      }
    },
    [applyMemberState, upsertMemberJobState],
  );

  useEffect(() => {
    if (!isJobStateLoaded) {
      return;
    }

    const previousMemberKey = currentMemberKeyRef.current;
    if (previousMemberKey) {
      upsertMemberJobState(previousMemberKey, snapshotCurrentMemberState());
    }

    pollingCancelledRef.current = true;
    staleJobRecoveryAttemptedRef.current = false;
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
      const pollPortfolioJob = pollPortfolioJobStatusRef.current;
      if (pollPortfolioJob) {
        pollPortfolioJob(savedState.jobId).catch(() => undefined);
      }
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
  let portfolioButtonLabel = copy.buttonIdle;
  if (isDownloadingPortfolio) {
    portfolioButtonLabel =
      portfolioJobStatus === "completed"
        ? copy.buttonDownloading
        : copy.buttonGenerating;
  } else if (portfolioJobStatus === "completed") {
    portfolioButtonLabel = copy.buttonCompleted;
  }

  const downloadPortfolioByJobId = async (jobId: string): Promise<void> => {
    const response = await fetch(`/api/members/portfolio/pdf/jobs/${encodeURIComponent(jobId)}/download`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await resolveErrorMessage(response, copy.downloadFailed);
      throw new PortfolioJobRequestError(message, response.status);
    }

    const blob = await response.blob();
    const fileName = resolveFileNameFromDisposition(
      response.headers.get("content-disposition"),
      portfolioFallbackFileName,
    );

    const objectUrl = globalThis.URL.createObjectURL(blob);
    const link = globalThis.document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    globalThis.document.body.appendChild(link);
    link.click();
    link.remove();
    globalThis.URL.revokeObjectURL(objectUrl);
  };

  async function startPortfolioJob(
    mode: "manual" | "stale-recovery" = "manual",
  ): Promise<void> {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    pollingCancelledRef.current = false;

    if (mode === "manual") {
      staleJobRecoveryAttemptedRef.current = false;
    }

    const startedAt = Date.now();
    downloadStartedAtRef.current = startedAt;
    setDownloadStartedAt(startedAt);
    activeJobIdRef.current = null;
    setActiveJobId(null);
    setPortfolioJobStatus("queued");
    setIsDownloadingPortfolio(true);
    setDownloadErrorMessage(null);
    setDownloadStatusMessage(
      mode === "stale-recovery"
        ? `${copy.staleJobMessage} ${copy.downloadDuration}`
        : `${copy.statusStarting} ${copy.downloadDuration}`,
    );

    try {
      const response = await fetch(startPortfolioJobUrl, {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        const message = await resolveErrorMessage(response, copy.jobFailed);
        throw new PortfolioJobRequestError(message, response.status);
      }

      const payload = normalizePortfolioJobResponse(await response.json(), {
        invalidResponse: copy.invalidResponse,
        missingJobId: copy.missingJobId,
      });
      activeJobIdRef.current = payload.jobId;
      setActiveJobId(payload.jobId);
      setPortfolioJobStatus(payload.status);

      const elapsedMs = Date.now() - (downloadStartedAtRef.current ?? Date.now());
      setDownloadStatusMessage(composeProgressMessage(payload.message, elapsedMs));
      setDownloadErrorMessage(null);

      if (payload.status === "failed") {
        pollingCancelledRef.current = true;
        staleJobRecoveryAttemptedRef.current = false;
        setPortfolioJobStatus("failed");
        setIsDownloadingPortfolio(false);
        throw new Error(copy.jobFailed);
      }

      if (payload.status === "completed") {
        staleJobRecoveryAttemptedRef.current = false;
        await handleCompletedPortfolioJob(payload.jobId, "auto");
        return;
      }

      pollPortfolioJobStatus(payload.jobId).catch(() => undefined);
    } catch (error) {
      pollingCancelledRef.current = true;
      staleJobRecoveryAttemptedRef.current = false;
      setPortfolioJobStatus("failed");
      setDownloadErrorMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : copy.downloadFailed,
      );
      setDownloadStatusMessage(null);
      setIsDownloadingPortfolio(false);
    }
  }

  async function recoverFromStalePortfolioJob(): Promise<void> {
    if (staleJobRecoveryAttemptedRef.current) {
      clearCurrentMemberJobState({
        statusMessage: null,
        errorMessage: copy.staleJobRetryMessage,
      });
      return;
    }

    staleJobRecoveryAttemptedRef.current = true;
    clearCurrentMemberJobState({
      statusMessage: copy.staleJobMessage,
      errorMessage: null,
      preserveRecoveryFlag: true,
    });
    await startPortfolioJob("stale-recovery");
  }

  async function handleCompletedPortfolioJob(
    jobId: string,
    mode: "auto" | "manual",
  ): Promise<void> {
    pollingCancelledRef.current = true;
    setPortfolioJobStatus("completed");

    if (mode === "auto" && !isOpenRef.current) {
      setDownloadStatusMessage(copy.autoReady);
      setDownloadErrorMessage(null);
      setIsDownloadingPortfolio(false);
      return;
    }

    setIsDownloadingPortfolio(true);
    setDownloadStatusMessage(
      mode === "auto"
        ? copy.autoDownloading
        : copy.manualDownloading,
    );
    setDownloadErrorMessage(null);

    try {
      await downloadPortfolioByJobId(jobId);
      staleJobRecoveryAttemptedRef.current = false;
      setDownloadStatusMessage(copy.downloadStarted);
      setDownloadErrorMessage(null);
    } catch (error) {
      if (error instanceof PortfolioJobRequestError && error.status === 404) {
        await recoverFromStalePortfolioJob();
        return;
      }

      setDownloadErrorMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : copy.downloadFailed,
      );
      setDownloadStatusMessage(copy.manualRetryReady);
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
      setDownloadErrorMessage(copy.waitTooLong);
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
        const message = await resolveErrorMessage(response, copy.jobFailed);
        if (response.status === 404) {
          await recoverFromStalePortfolioJob();
          return;
        }

        throw new PortfolioJobRequestError(message, response.status);
      }

      const data = normalizePortfolioJobResponse(await response.json(), {
        invalidResponse: copy.invalidResponse,
        missingJobId: copy.missingJobId,
      });
      if (pollingCancelledRef.current) {
        return;
      }
      if (data.status === "completed") {
        staleJobRecoveryAttemptedRef.current = false;
        setPortfolioJobStatus("completed");
        await handleCompletedPortfolioJob(jobId, "auto");
        return;
      }

      if (data.status === "failed") {
        pollingCancelledRef.current = true;
        staleJobRecoveryAttemptedRef.current = false;
        setPortfolioJobStatus("failed");
        throw new Error(copy.jobFailed);
      }

      setPortfolioJobStatus(data.status);
      setDownloadStatusMessage(composeProgressMessage(data.message, elapsedMs));
      setDownloadErrorMessage(null);
      pollingTimerRef.current = setTimeout(() => {
        pollPortfolioJobStatus(jobId).catch(() => undefined);
      }, PORTFOLIO_JOB_POLL_INTERVAL_MS);
    } catch (error) {
      pollingCancelledRef.current = true;
      setPortfolioJobStatus("failed");
      setDownloadErrorMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : copy.downloadFailed,
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
    await startPortfolioJob("manual");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl lg:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 pt-6 pb-4 sm:px-6 lg:px-8 border-b border-border/30 sticky top-0 bg-background z-10 flex flex-row items-center justify-between">
          <DialogTitle className="sr-only">
            {t("dialogTitle", { name: member.name })}
          </DialogTitle>
          <DialogClose
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("close")}</span>
          </DialogClose>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-4 pt-6 pb-6 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-border/30">
            <MemberAvatar
              name={member.name}
              profileImage={member.profileImage}
              sizeClassName="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32"
              sizes="128px"
              fallbackClassName="w-full h-full rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-4xl"
            />
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
                      <span>{t("homepage")}</span>
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
                      <span>{t("blog")}</span>
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
                <output className="mt-2 flex flex-col gap-1" aria-live="polite" aria-atomic="true">
                  {downloadStatusMessage && !downloadErrorMessage && (
                    <span className="text-xs text-muted-foreground">{downloadStatusMessage}</span>
                  )}
                  {isPortfolioGenerating && (
                    <span className="text-xs text-muted-foreground/80">
                      {copy.keepRunningHint}
                    </span>
                  )}
                  {downloadErrorMessage && (
                    <span className="text-xs text-red-500">{downloadErrorMessage}</span>
                  )}
                </output>
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
                <span className="w-1 h-5 sm:h-6 bg-primary rounded-full shrink-0" />{" "}
                {t("bio")}
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
                {t("specialties")}
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {member.specialties.map((specialty) => (
                  <span
                    key={specialty}
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
                {t("education")}
              </h3>
              <div className="space-y-4 sm:space-y-5">
                {member.education.map((edu) => (
                  <div
                    key={`${edu.university}-${edu.degree}-${edu.major}-${edu.period ?? "unknown"}`}
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
                        <p className="text-xs text-muted-foreground/70 mb-1">{t("thesis")}</p>
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
                        <p className="text-xs text-muted-foreground/70 mb-2">{t("papers")}</p>
                        <div className="space-y-2">
                          {edu.papers.map((paper) => (
                            <div key={`${paper.title}-${paper.type}-${paper.date}`} className="text-xs sm:text-sm">
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
                {t("workExperience")}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {member.workExperience.map((exp) => (
                  <div
                    key={`${exp.company}-${exp.position}-${exp.period}`}
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
                      {exp.description.map((desc) => (
                        <li
                          key={`${exp.company}-${desc}`}
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
                {t("achievements", { count: member.achievements.length })}
              </h3>
              <div className="space-y-2 sm:space-y-2.5">
                {member.achievements.map((achievement) => (
                  <div
                    key={achievement}
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
                {t("certifications", { count: member.certifications.length })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {member.certifications.map((cert) => (
                  <div
                    key={`${cert.name}-${cert.issuer}-${cert.date ?? "unknown"}`}
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
                {t("projects", { count: member.projects.length })}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {member.projects.map((project) => (
                  <div
                    key={`${project.title}-${project.industry ?? "unknown"}`}
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
                      {project.technologies.map((tech) => (
                        <span
                          key={`${project.title}-${tech}`}
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
                {member.technicalSkills.map((skillGroup) => (
                  <div
                    key={skillGroup.category}
                    className="p-3 sm:p-4 rounded-lg bg-card/50 border border-border/20"
                  >
                    <p className="font-semibold text-sm mb-2">{skillGroup.category}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {skillGroup.skills.map((skill) => (
                        <span
                          key={skill}
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
                {t("mentoring")}
              </h3>
              <div className="p-3 sm:p-4 rounded-lg bg-card/50 border border-border/20">
                <p className="text-sm sm:text-base text-muted-foreground wrap-break-word">
                  {t.rich("mentoringBody", {
                    count: member.mentoring.count,
                    strong: (chunks) => (
                      <span className="font-semibold text-primary">{chunks}</span>
                    ),
                  })}
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
