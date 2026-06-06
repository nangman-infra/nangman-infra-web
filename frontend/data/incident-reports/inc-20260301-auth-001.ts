import type { IncidentReport } from "./types";

export const inc20260301Auth001: IncidentReport = {
  id: "INC-20260301-AUTH-001",
  slug: "inc-20260301-auth-001",
  title: "auth.nangman.cloud 접속 장애 (서울-대전 WireGuard 연동 구간)",
  status: "resolved",
  severity: "SEV-2",
  startedAtIso: "2026-03-01T18:42:38+09:00",
  resolvedAtIso: "2026-03-02T13:59:00+09:00",
  startedAt: "2026-03-01 18:42:38 KST",
  resolvedAt: "2026-03-02 13:59 KST",
  owner: "리포터: 이성원 / 작업자: 이성원",
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
};
