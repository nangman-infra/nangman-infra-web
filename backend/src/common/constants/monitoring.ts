/**
 * 모니터링 관련 상수 정의
 * 가이드라인: Magic Number를 상수로 정의하여 유지보수성 향상
 */

// 타임아웃 관련
export const UPS_TIMEOUT_MS = 5_000; // UPS 조회 타임아웃 (5초)
export const DEFAULT_TIMEOUT_MS = 10_000; // 기본 HTTP 요청 타임아웃 (10초)

// 임계값 관련
export const CPU_HIGH_THRESHOLD_PERCENT = 80; // CPU 고부하 임계값 (%)
export const NETWORK_TRAFFIC_HIGH_THRESHOLD_MBPS = 100; // 네트워크 트래픽 고부하 임계값 (Mbps)

// 로그 관련
export const MAX_LOG_DISPLAY_COUNT = 6; // 최대 로그 표시 개수
export const MAX_TRAFFIC_HISTORY_LENGTH = 20; // 트래픽 히스토리 최대 길이
export const MONITORING_CACHE_TTL_MS = 10_000; // 모니터링 API 캐시 TTL (10초)

// 계산식 관련 상수
export const PERCENTAGE_MULTIPLIER = 100; // 퍼센트 계산용 (100%)
export const BYTES_TO_MBPS_DIVISOR = 1_000_000; // 바이트를 Mbps로 변환 (1,000,000 바이트 = 1 MB)
export const BITS_PER_BYTE = 8; // 바이트를 비트로 변환 (1 바이트 = 8 비트)
export const MS_TO_SECONDS_DIVISOR = 1_000; // 밀리초를 초로 변환 (1,000ms = 1초)
export const UPTIME_PRECISION_MULTIPLIER = 10_000; // Uptime 계산 정밀도 (소수점 2자리)
export const UPTIME_PRECISION_DIVISOR = 100; // Uptime 계산 정밀도 (소수점 2자리)
export const GATEWAY_LATENCY_MULTIPLIER = 0.15; // Gateway latency 계산 계수
export const DECIMAL_PRECISION_MULTIPLIER = 10; // 소수점 반올림 정밀도 (소수점 1자리)
export const DECIMAL_PRECISION_DIVISOR = 10; // 소수점 반올림 정밀도 (소수점 1자리)
export const DEFAULT_IOWAIT_VALUE = 0.02; // 기본 ioWait 값

// 네트워크 프로브 관련
export const DNS_PROBE_HOSTNAME = 'nangman.cloud'; // DNS 조회 대상 호스트명
export const BACKBONE_PING_TARGET = '8.8.8.8'; // 백본 핑 대상 (Google DNS)
