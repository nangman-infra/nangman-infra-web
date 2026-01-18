/**
 * 터미널 관련 상수 정의
 * 가이드라인: Magic Number를 상수로 정의하여 유지보수성 향상
 */

// 터미널에서 접근 가능한 페이지 라우트 목록
export const TERMINAL_ROUTES = [
  "about",
  "projects",
  "members",
  "blog",
  "contact",
  "monitoring",
  "services",
] as const;

// 터미널 색상 상수
export const TERMINAL_COLORS = {
  // 명령어 및 프롬프트 색상
  COMMAND: "#0DBC79", // 초록색 (명령어, 프롬프트)
  ERROR: "#F14C4C", // 빨간색 (에러)
  SYSTEM: "#3B78FF", // 파란색 (시스템 메시지)
  TEXT: "#CCCCCC", // 기본 텍스트 색상
  TEXT_MUTED: "#888888", // 비활성 텍스트 색상
  PLACEHOLDER: "#666666", // 플레이스홀더 색상
  
  // UI 색상
  BACKGROUND: "#0C0C0C", // 터미널 배경색
  TAB_BACKGROUND: "rgba(30, 30, 30, 0.6)", // 탭 배경색
  TAB_ACTIVE_BACKGROUND: "#0C0C0C", // 활성 탭 배경색
  TAB_ACTIVE_INDICATOR: "#0078D4", // 활성 탭 인디케이터 색상
  CLOSE_BUTTON_HOVER: "#F14C4C", // 닫기 버튼 호버 색상
} as const;
