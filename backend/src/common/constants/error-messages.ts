/**
 * 에러 메시지 상수 정의
 * 가이드라인: Magic Number/String을 상수로 정의하여 유지보수성 향상
 */
export const ERROR_MESSAGES = {
  // Mattermost 관련 에러
  MATTERMOST: {
    WEBHOOK_URL_NOT_SET: 'Mattermost Webhook URL이 설정되지 않았습니다.',
    WEBHOOK_CALL_FAILED: 'Mattermost Webhook 호출 실패',
    MESSAGE_SEND_FAILED: (errorMessage: string) =>
      `메시지 전송에 실패했습니다: ${errorMessage}`,
  },

  // Kuma 관련 에러
  KUMA: {
    URL_NOT_SET: 'Kuma URL이 설정되지 않았습니다.',
    STATUS_PAGE_SLUG_NOT_SET: 'Kuma Status Page Slug가 설정되지 않았습니다.',
    CONNECTION_TIMEOUT:
      'Kuma 서버에 연결할 수 없습니다. 타임아웃이 발생했습니다.',
    STATUS_PAGE_NOT_FOUND: 'Kuma 상태 페이지를 찾을 수 없습니다.',
    API_CALL_FAILED: (statusText: string) =>
      `Kuma API 호출 실패: ${statusText}`,
    CONNECTION_FAILED: 'Kuma 서버에 연결할 수 없습니다.',
    UNKNOWN_ERROR: '모니터링 상태를 가져오는 중 오류가 발생했습니다.',
  },

  // 일반 에러
  GENERAL: {
    INTERNAL_SERVER_ERROR: 'Internal server error',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  },
} as const;
