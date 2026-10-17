"use client";

import { useCallback, useEffect, useState } from "react";
import type { SecurityFilter, SecuritySnapshot } from "@/lib/domain/security";

export function useSecurityOverview(filter: SecurityFilter) {
  const [state, setState] = useState<{
    filter: SecurityFilter; data: SecuritySnapshot | null; error: boolean; refreshing: boolean;
  }>({ filter, data: null, error: false, refreshing: true });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let busy = false;
    const load = async () => {
      if (busy || controller.signal.aborted || document.hidden) return;
      busy = true;
      setState((previous) => ({ ...previous, refreshing: true }));
      try {
        const response = await fetch(`/api/security/overview?source=${filter}`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(40_000)]),
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok || !payload.success || payload.data?.filter !== filter ||
          !Array.isArray(payload.data.sources) || !Array.isArray(payload.data.events)) {
          throw new Error("Security overview unavailable");
        }
        if (!controller.signal.aborted) {
          setState({ filter, data: payload.data as SecuritySnapshot, error: false, refreshing: false });
        }
      } catch {
        if (!controller.signal.aborted) {
          setState((previous) => ({
            filter, data: previous.filter === filter ? previous.data : null,
            error: true, refreshing: false,
          }));
        }
      } finally {
        busy = false;
        if (!controller.signal.aborted) timer = setTimeout(() => void load(), 10_000);
      }
    };
    const onVisibility = () => {
      clearTimeout(timer);
      if (!document.hidden) void load();
    };
    void load();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [filter, revision]);

  return {
    data: state.filter === filter ? state.data : null,
    error: state.filter === filter && state.error,
    refreshing: state.filter !== filter || state.refreshing,
    refresh,
  };
}
