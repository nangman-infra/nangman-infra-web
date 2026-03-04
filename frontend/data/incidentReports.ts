export type IncidentSeverity = "SEV-1" | "SEV-2" | "SEV-3";
export type IncidentStatus = "resolved" | "investigating" | "mitigated";

export interface IncidentTimelineEntry {
  at: string;
  event: string;
  evidence?: string;
}

export interface IncidentReport {
  id: string;
  slug: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startedAtIso: string;
  resolvedAtIso: string;
  startedAt: string;
  resolvedAt: string;
  owner: string;
  impactedService: string;
  summary: string;
  technicalImpact: string;
  topology: string[];
  rootCause: string;
  contributingFactors: string[];
  evidence: string[];
  timeline: IncidentTimelineEntry[];
  resolution: string[];
  followUp: {
    title: string;
    scope: string;
    checklist: string[];
    exitCriteria: string;
  };
  tags: string[];
}

export const incidentReports: IncidentReport[] = [
  {
    id: "INC-20260301-AUTH-001",
    slug: "inc-20260301-auth-001",
    title: "auth.nangman.cloud 접속 장애 (서울-대전 WireGuard 연동 구간)",
    status: "resolved",
    severity: "SEV-2",
    startedAtIso: "2026-03-01T18:42:38+09:00",
    resolvedAtIso: "2026-03-02T13:59:00+09:00",
    startedAt: "2026-03-01 18:42:38 KST",
    resolvedAt: "2026-03-02 13:59 KST",
    owner: "이성원",
    impactedService: "https://auth.nangman.cloud",
    summary:
      "OPNsense 재부팅 이후 외부 도메인 기반 인증 경로가 실패했습니다. 내부 직접 주소(172.16.0.14:9443)는 정상으로 확인되어 애플리케이션 장애가 아닌 NPM-Auth 간 WireGuard 경로 단절 이슈로 판단했습니다.",
    technicalImpact:
      "서울 NPM과 대전 Auth 서버 사이 WireGuard 구간 단절로 OIDC 기반 내부 애플리케이션 4건에서 로그인 및 토큰 교환이 실패했습니다.",
    topology: [
      "Client (Internet) -> HTTPS 443 -> Nginx Proxy Manager (Seoul)",
      "Nginx Proxy Manager -> WireGuard (UDP 51821) -> Auth Server (Daejeon, 172.16.0.14:9443)",
      "Auth Server -> OIDC endpoints (/authorize, /token, /userinfo, /jwks)",
    ],
    rootCause:
      "OPNsense 부팅 시 WAN/DHCP/필터/라우팅/WireGuard가 순차 복구되는 과정에서 터널 경로 안정화가 지연되었고, 해당 시점에 프록시-업스트림 인증 경로가 단절되었습니다.",
    contributingFactors: [
      "부팅 직후 UDP 51821 처리 상태가 block에서 pass로 전환되는 타이밍 구간 존재",
      "피어별 재핸드셰이크/endpoint 재학습 속도 차이",
      "state table 초기화 직후 세션 재수립 지연",
      "기존 25초 헬스체크가 인증 E2E 체인까지 검증하지 못함",
    ],
    evidence: [
      "kern.boottime: Sun Mar 1 18:42:38 2026",
      "18:44:12~13 filterlog: WAN inbound UDP 51821 block -> pass 전환 관측",
      "18:44:19~20 wireguard_configure_do 및 Configuring WireGuard VPN 완료 로그",
      "2026-03-02 13:59 wg show 기준 peer handshake 2분 이내 갱신 확인",
    ],
    timeline: [
      {
        at: "2026-03-01 18:42:38",
        event: "OPNsense 재부팅 시작",
        evidence: "kern.boottime",
      },
      {
        at: "2026-03-01 18:42:54",
        event: "초기 ping 100% loss 구간",
      },
      {
        at: "2026-03-01 18:44:07",
        event: "wg0 인터페이스 구성 시작",
      },
      {
        at: "2026-03-01 18:44:12",
        event: "WAN 링크 UP 및 DHCP 공인 IP 할당",
      },
      {
        at: "2026-03-01 18:44:12~18:44:13",
        event: "UDP 51821 inbound block -> pass 전환",
      },
      {
        at: "2026-03-01 18:44:19~18:44:20",
        event: "WireGuard configure 완료",
      },
      {
        at: "2026-03-02 오전",
        event: "외부 도메인 인증 경로 실패 인지",
      },
      {
        at: "2026-03-02 13:59",
        event: "peer handshake 정상 갱신 확인 및 복구 확인",
      },
    ],
    resolution: [
      "WireGuard peer 상태 및 handshake freshness 점검",
      "NPM -> Auth 업스트림 연결 재검증",
      "auth.nangman.cloud 외부 경로 복구 확인",
      "OIDC 영향 애플리케이션 4건 로그인 성공 확인",
    ],
    followUp: {
      title: "Maintenance Runbook 작성 및 의무 적용",
      scope:
        "방화벽/VPN/프록시/인증 관련 고임팩트 변경 작업 전체",
      checklist: [
        "작업 전: wg show handshake 최신성 확인",
        "작업 전: NPM -> Auth 업스트림 reachability 확인",
        "작업 후: auth.nangman.cloud E2E 접근 확인",
        "작업 후: OIDC 영향 앱 4건 로그인 검증",
        "작업 후: 로그 증적 첨부 및 변경 기록 남김",
      ],
      exitCriteria:
        "체크리스트 전 항목 통과 전까지 작업 종료 불가 (미통과 시 추가 복구 또는 롤백)",
    },
    tags: [
      "#incident",
      "#auth",
      "#wireguard",
      "#nginx-proxy-manager",
      "#oidc",
      "#runbook",
    ],
  },
  {
    id: "INC-20260304-AUTH-002",
    slug: "inc-20260304-auth-002",
    title: "OIDC Subject 식별자 불일치로 인한 연동 서비스 데이터 조회 장애",
    status: "resolved",
    severity: "SEV-2",
    startedAtIso: "2026-03-04T09:00:00+09:00",
    resolvedAtIso: "2026-03-04T18:00:00+09:00",
    startedAt: "2026-03-04 09:00 KST",
    resolvedAt: "2026-03-04 18:00 KST",
    owner: "리포터: 김주형 / 작업자: 이성원",
    impactedService:
      "auth.nangman.cloud 연동 서비스 (Meet, Mail, Note, Harbor)",
    summary:
      "인증 자체는 성공했지만 일부 사용자에서 기존 개인 데이터 조회가 실패했습니다. Authentik 감사 로그 분석 결과 장애 인지 시점(09:00~11:00 KST)에는 Provider 쓰기 이벤트가 없었고, 과거 Provider 삭제/재생성 이력으로 인한 Subject 식별자 드리프트가 원인으로 확인되었습니다.",
    technicalImpact:
      "OIDC 토큰 발급은 정상(로그인 성공)이나 서비스 DB가 보유한 기존 owner_sub/oidc_sub와 신규 sub가 불일치하여 기존 데이터 조회가 실패했습니다.",
    topology: [
      "Client -> auth.nangman.cloud (OIDC Authorization Code Flow)",
      "Authentik Provider -> ID Token/JWT sub claim 발급",
      "Meet/Mail/Note/Harbor -> sub 기반 사용자/리소스 매핑",
      "Service DB -> owner_sub/oidc_sub 기준 데이터 조회",
    ],
    rootCause:
      "과거 hash(user_pk + provider_pk) 기반 Subject 체계에서 Provider 삭제/재생성 이력이 누적되며 동일 사용자의 sub가 변동되었습니다. 그 결과 서비스 DB의 기존 식별자와 신규 토큰 식별자가 불일치했습니다.",
    contributingFactors: [
      "2026-03-02 Provider 삭제(all/11) 및 재구성(oauth2/13) 이력 존재",
      "2026-03-04 다수 Provider(oauth2/13,8,10,1,15) 설정 갱신",
      "서비스 DB가 sub를 영속 식별자로 사용하여 변경 영향이 직접 전파",
      "장애 인지 시점과 실제 설정 변경 시점이 달라 초기 원인 파악이 지연",
    ],
    evidence: [
      "2026-03-04 09:00~11:00 KST 구간 감사 이벤트 3건: 모두 로그인/인가 흐름, Provider 쓰기 이벤트 없음",
      "Provider 쓰기 이력: DELETE /api/v3/providers/all/11/ (2026-03-02 14:12:17 KST)",
      "Provider 쓰기 이력: PUT /api/v3/providers/oauth2/13/ (2026-03-02 14:17:40 KST 이후 다수)",
      "Provider 쓰기 이력: PUT /api/v3/providers/oauth2/13,8,10,1 (2026-03-04 12:51~12:52 KST)",
      "현재 OIDC 앱(provider 1/8/10/13/15) sub_mode=user_email 통일 확인",
    ],
    timeline: [
      {
        at: "2026-03-02 14:12:17",
        event: "TransNote OIDC Provider 삭제",
        evidence: "DELETE /api/v3/providers/all/11/",
      },
      {
        at: "2026-03-02 14:17:40",
        event: "TransNote OIDC Provider 재구성 시작",
        evidence: "PUT /api/v3/providers/oauth2/13/",
      },
      {
        at: "2026-03-04 09:00",
        event: "로그인 후 기존 데이터 조회 실패 증상 접수",
      },
      {
        at: "2026-03-04 12:51~12:52",
        event: "Harbor/Mail/Meet/Note 관련 Provider 설정 갱신",
        evidence: "PUT /api/v3/providers/oauth2/13,8,10,1",
      },
      {
        at: "2026-03-04 17:17:01",
        event: "Jenkins Provider 설정 갱신",
        evidence: "PUT /api/v3/providers/oauth2/15",
      },
      {
        at: "2026-03-04 18:00",
        event: "email 기반 sub 통일 및 서비스 정합성 확인 완료",
      },
    ],
    resolution: [
      "Authentik 감사 이벤트(events_event) 기반 시계열 분석으로 변경 시점과 장애 인지 시점 분리 확인",
      "OIDC 앱(provider 1/8/10/13/15) sub_mode를 user_email 기준으로 통일",
      "서비스별 sub 정합성 점검 및 영향 데이터 보정 완료",
      "영향 서비스(Meet, Mail, Note, Harbor) 정상 로그인 및 기존 데이터 조회 확인",
    ],
    followUp: {
      title: "OIDC Subject 변경 통제 정책",
      scope:
        "auth.nangman.cloud 연동 OIDC Provider 전체",
      checklist: [
        "OIDC 식별자 정책 고정: sub_mode=user_email 유지",
        "Provider 삭제/재생성 작업 시 사전 영향도 점검 필수(서비스 DB sub 보정 계획 포함)",
      ],
      exitCriteria:
        "OIDC Provider 변경 작업은 사전 영향도 점검 문서와 보정 계획 승인 없이는 수행하지 않음",
    },
    tags: [
      "#incident",
      "#auth",
      "#oidc",
      "#subject",
      "#sub-mode",
      "#identity-consistency",
    ],
  },
];
