import { useState, useEffect, useCallback } from 'react';
import { getMonitoringStatus, type MonitorStatus, type MonitoringStatusResponse } from '@/lib/api';
import { MONITORING_REFRESH_INTERVAL_MS } from '@/constants/monitoring';

type InsightsData = NonNullable<MonitoringStatusResponse['data']>['insights'];

interface MonitoringState {
  monitors: MonitorStatus[];
  summary: { total: number; online: number; offline: number; pending: number };
  insights: InsightsData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

/**
 * 모니터링 상태를 관리하는 커스텀 훅
 * 가이드라인: 로직을 컴포넌트에서 분리하여 재사용성 향상
 */
export function useMonitoringStatus() {
  const [state, setState] = useState<MonitoringState>({
    monitors: [],
    summary: { total: 0, online: 0, offline: 0, pending: 0 },
    insights: null,
    loading: true,
    error: null,
    lastUpdate: null,
  });

  const fetchMonitoringStatus = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        loading: prev.monitors.length === 0,
        error: null,
      }));

      const response = await getMonitoringStatus();

      if (response.success && response.data) {
        setState({
          monitors: response.data.monitors || [],
          summary: response.data.summary || {
            total: 0,
            online: 0,
            offline: 0,
            pending: 0,
          },
          insights: response.data.insights || null,
          loading: false,
          error: null,
          lastUpdate: new Date(),
        });
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.message || '데이터를 가져오는데 실패했습니다.',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : '서버 연결 오류',
      }));
    }
  }, []);

  useEffect(() => {
    // 초기 로드
    const initFetch = async () => {
      await fetchMonitoringStatus();
    };
    initFetch();

    // 주기적 새로고침
    const interval = setInterval(
      fetchMonitoringStatus,
      MONITORING_REFRESH_INTERVAL_MS,
    );

    return () => clearInterval(interval);
  }, [fetchMonitoringStatus]);

  return {
    ...state,
    refetch: fetchMonitoringStatus,
  };
}

