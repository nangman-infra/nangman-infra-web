/**
 * 모니터링 관련 상수 정의
 * 가이드라인: Magic Number를 상수로 정의하여 유지보수성 향상
 */

// 자동 새로고침 간격 (밀리초)
export const MONITORING_REFRESH_INTERVAL_MS = 30_000;

// 마지막 업데이트 텍스트 업데이트 간격 (밀리초)
export const LAST_UPDATE_TEXT_REFRESH_INTERVAL_MS = 1_000;

// 랙 표시 순서 정의 (English Hierarchy)
export const RACK_ORDER = [
  'Network',
  'Management Infrastructure',
  'Compute Nodes',
  'Web Servers',
  'External Monitoring',
] as const;

// 기본 디바이스 U 크기
export const DEFAULT_DEVICE_U = 3;

// 전체 랙 U 크기
export const TOTAL_RACK_U = 42;

// 트래픽 히스토리 최대 길이
export const MAX_TRAFFIC_HISTORY_LENGTH = 20;

// 로그 최대 표시 개수
export const MAX_LOG_DISPLAY_COUNT = 6;
