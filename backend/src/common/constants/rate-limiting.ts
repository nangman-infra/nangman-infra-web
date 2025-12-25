/**
 * Rate Limiting 관련 상수 정의
 * 가이드라인: Magic Number를 상수로 정의하여 유지보수성 향상
 */

// Rate Limiting 설정
export const RATE_LIMIT_REQUESTS_PER_HOUR = 5; // 1시간당 요청 제한 횟수
export const RATE_LIMIT_TTL_MS = 60 * 60 * 1_000; // Rate limit TTL (1시간, 밀리초)
