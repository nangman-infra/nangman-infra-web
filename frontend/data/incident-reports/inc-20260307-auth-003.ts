import type { IncidentReport } from "./types";

export const inc20260307Auth003: IncidentReport = {
  id: "INC-20260307-AUTH-003",
  slug: "inc-20260307-auth-003",
  title: "Authentik SAML, OIDC 인증 깨짐 현상",
  status: "resolved",
  severity: "SEV-2",
  startedAtIso: "2026-03-07T21:00:00+09:00",
  resolvedAtIso: "2026-03-07T22:00:00+09:00",
  startedAt: "2026-03-07 21:00 KST",
  resolvedAt: "2026-03-07 22:00 KST",
  owner: "리포터: 김주형 / 작업자: 이성원, 김주형",
  impactedService:
    "Authentik 연동 서비스 중 Name Field 값을 요구하는 서비스 (Authentik, Ansible AWX, Harbor)",
  summary:
    "인증 자체는 성공했지만 일부 사용자에서 Authentik -> 서비스 사이트 값 전송이 실패했습니다. Authentik 감사 로그 분석 결과 장애 인지 시점(21:00~22:00 KST) 기준 해당 사용자의 GitHub Name Field 값 및 Authentik display name Field가 비어 있었고, Name Field 제공 불가로 인해 사이트 접근 불가가 발생했습니다.",
  technicalImpact:
    "OIDC 토큰 발급은 정상(로그인 성공)이었지만 GitHub API에서 Name Field가 NULL인 사용자는 해당 값을 리턴하지 못했고, Name Field를 요구하는 일부 연동 서비스에서 후속 인증과 사용자 매핑이 실패했습니다.",
  topology: [
    "Client -> auth.nangman.cloud (OIDC Authorization Code Flow)",
    "GitHub -> Authentik (OAuth Access Token)",
    "Authentik Provider -> ID Token/JWT sub claim 발급",
    "연동 서비스(Authentik, Ansible AWX, Harbor) -> Name Field 기반 사용자 정보 확인",
    "Service DB -> 맵핑 정보 확인 및 서비스 접근 처리",
  ],
  rootCause:
    "일부 사용자의 GitHub Public Name 값이 비어 있었고, Authentik display name도 NULL 상태였습니다. 그 결과 Authentik이 서비스 측에 필요한 Name Field를 제공하지 못해 로그인 이후 서비스 접근 단계에서 실패가 발생했습니다.",
  contributingFactors: [
    "초기 GitHub 설정부터 Name Field가 NULL 상태인 사용자 다수 존재",
    "기존 사용 서비스들은 Name Field 값을 요구하지 않아 사전 탐지가 어려웠음",
    "일부 사용자만 Name Field가 NULL 상태여서 장애 인지가 지연됨",
  ],
  evidence: [
    "해당 사용자의 GitHub Name Field를 채우자 오류가 즉시 해결됨",
    "Name Field가 존재하는 사용자는 동일 장애가 발생하지 않음",
    "장애 인지 시점(21:00~22:00 KST) 감사 로그에서 Authentik display name Field NULL 상태 확인",
  ],
  timeline: [
    {
      at: "2026-03-07 20:00",
      event: "OIDC 통합 후 서비스 재가동",
    },
    {
      at: "2026-03-07 21:00",
      event: "특정 사용자에서 로그인 무한 루프 현상 발생",
    },
    {
      at: "2026-03-07 21:15~21:25",
      event: "Authentik 로그인 접속 기록 감사",
    },
    {
      at: "2026-03-07 21:30",
      event: "Authentik display name Field 값 NULL 확인",
    },
    {
      at: "2026-03-07 21:40",
      event: "영향 사용자 대상 GitHub Public Name Field 재구성",
    },
    {
      at: "2026-03-07 21:41~21:59",
      event: "Authentik display name Field 및 GitHub Name Field 구성 완료",
    },
    {
      at: "2026-03-07 22:00",
      event: "서비스 정상 접근 복구 확인",
    },
  ],
  resolution: [
    "Authentik 로그인 감사 기록 기반으로 오류 지점 확인",
    "영향 사용자 대상으로 GitHub Name Field 값 구성 의무화",
    "GitHub Field 구성을 Authentik display name Field보다 우선하는 기준으로 정리",
    "Name Field 요구 서비스(Authentik, Ansible AWX, Harbor) 정상 접근 확인",
  ],
  followUp: {
    title: "Identity Profile Completeness Policy",
    scope: "GitHub-Authentik 연동 사용자 전체 및 Name Field 의존 서비스",
    checklist: [
      "GitHub Public Name 미입력 사용자 점검 및 보완",
      "Authentik display name NULL 사용자 정기 점검",
      "Name Field 의존 서비스 목록 문서화 및 신규 서비스 연동 시 사전 확인",
      "사용자 프로필 필수값 누락 시 운영자 알림 절차 정리",
    ],
    exitCriteria:
      "GitHub Name Field 또는 Authentik display name 누락 사용자가 없고, Name Field 의존 서비스의 로그인 검증이 완료되어야 종료",
  },
  tags: [
    "#incident",
    "#auth",
    "#oidc",
    "#saml",
    "#authentik",
    "#github",
    "#name-field",
  ],
};
