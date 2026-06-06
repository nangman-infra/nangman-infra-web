import type { IncidentReport } from "./types";

export const inc20260604Proxy001: IncidentReport = {
  id: "INC-20260604-PROXY-001",
  slug: "inc-20260604-proxy-001",
  title: "리버스 프록시 서버 NIC 링크 불안정 장애",
  status: "resolved",
  severity: "SEV-3",
  startedAtIso: "2026-06-04T00:40:00+09:00",
  resolvedAtIso: "2026-06-04T00:52:00+09:00",
  startedAt: "2026-06-04 00:40 KST",
  resolvedAt: "2026-06-04 00:52 KST",
  owner: "리포터: 정희훈 / 작업자: 이성원, 유재영",
  impactedService:
    "리버스 프록시를 통해 외부에서 접근하는 내부 서비스, 리버스 프록시",
  summary:
    "연구실 리버스 프록시 서버에서 인터넷 연결이 간헐적으로 붙었다 끊기는 현상이 발생했습니다. 초기에는 서비스 포트 또는 네트워크 포트 문제를 의심했으나, ethtool 확인 결과 NIC 링크가 반복적으로 down/up 상태를 보였고 기가비트 포트 환경에서도 100Mb/s Full Duplex로 협상되는 현상이 확인되었습니다. 포트 변경 후에도 동일 증상이 재현되었으며, Ethernet 랜선 교체 이후 1000Mb/s Full Duplex로 정상 협상되어 물리 케이블 불량으로 판단했습니다.",
  technicalImpact:
    "리버스 프록시 서버의 물리 네트워크 링크가 불안정해지면서 외부 인터넷 연결이 간헐적으로 단절되었습니다. 이로 인해 리버스 프록시를 경유하는 내부 서비스의 외부 접근이 일시적으로 불가하거나 느려질 수 있었습니다.",
  topology: [
    "Client / Internet -> Ethernet 링크",
    "Ethernet 링크 -> Reverse Proxy Server",
    "Reverse Proxy Server -> Nginx / Reverse Proxy",
    "Nginx / Reverse Proxy -> 내부 서비스 업스트림",
  ],
  rootCause:
    "리버스 프록시 서버와 네트워크 장비 사이의 Ethernet 케이블 상태 불량으로 인해 링크 협상이 불안정해진 것으로 판단했습니다. 랜선 교체 이후 동일 포트 계층에서 1000Mb/s Full Duplex와 Link detected yes 상태가 확인되어 케이블 불량 가능성이 가장 높았습니다.",
  contributingFactors: [
    "NIC 링크가 Link detected no 상태로 반복 전환됨",
    "기가비트 포트 환경임에도 100Mb/s Full Duplex로 협상됨",
    "네트워크 포트 변경 후에도 동일 증상이 재현됨",
    "랜선 교체 후 1000Mb/s Full Duplex로 정상 협상됨",
    "리버스 프록시 경로 특성상 단일 물리 링크 불안정이 다수 내부 서비스 외부 접근에 전파됨",
  ],
  evidence: [
    "장애 확인 중 ethtool enp2s0 명령으로 NIC 상태 확인",
    "장애 중 링크 단절 상태: Speed Unknown, Duplex Unknown, Link detected no",
    "일부 시점에서 100Mb/s로 협상된 상태: Speed 100Mb/s, Duplex Full, Link detected yes",
    "랜선 교체 이후 정상 협상 상태: Speed 1000Mb/s, Duplex Full, Link detected yes",
    "2026-06-04 01:12 KST 외부 통신 가능 상태 확인",
    "speedtest-cli 후속 확인: GLBB Japan Naha, Latency 69.482 ms, Download 64.67 Mbit/s, Upload 11.06 Mbit/s",
    "Speedtest 측정 서버가 해외에 위치해 지연 시간은 증가했으나, 랜선 교체 이후 외부 통신 가능 여부를 확인하는 참고 자료로 사용",
    "Ubuntu ethtool 매뉴얼 기준 ethtool은 단일 장치 인자로 현재 Ethernet 장치 설정을 출력하며, speed와 duplex 상태 확인에 사용할 수 있음",
  ],
  timeline: [
    {
      at: "2026-06-04 00:40",
      event: "리버스 프록시 서버 인터넷 연결 불안정 현상 확인",
    },
    {
      at: "2026-06-04 00:42",
      event: "ethtool enp2s0로 NIC 링크 상태 확인",
    },
    {
      at: "2026-06-04 00:42",
      event: "Link detected no, Speed Unknown 상태 확인",
    },
    {
      at: "2026-06-04 00:50",
      event: "포트 문제 가능성을 의심하여 네트워크 포트 변경",
    },
    {
      at: "2026-06-04 00:50",
      event: "기가비트 포트 환경에서 100Mb/s Full Duplex로 협상되는 현상 확인",
    },
    {
      at: "2026-06-04 00:51",
      event: "Ethernet 랜선 교체",
    },
    {
      at: "2026-06-04 00:52",
      event: "1000Mb/s Full Duplex, Link detected yes 확인",
    },
    {
      at: "2026-06-04 01:12",
      event: "외부 통신 가능 여부 확인",
    },
    {
      at: "2026-06-05 01:10",
      event: "speedtest-cli로 외부 통신 상태 후속 확인",
    },
  ],
  resolution: [
    "ethtool enp2s0 명령으로 NIC 링크 상태 확인",
    "네트워크 포트 변경 테스트",
    "Ethernet 랜선 교체",
    "랜선 교체 후 1000Mb/s Full Duplex 링크 협상 확인",
    "외부 통신 가능 여부 확인",
  ],
  followUp: {
    title: "Reverse Proxy Link Health Standard",
    scope:
      "연구실 리버스 프록시 서버와 외부 접근 경로에 연결된 물리 네트워크 링크",
    checklist: [
      "리버스 프록시 서버의 NIC 링크 상태 모니터링 추가",
      "Link detected no 발생 시 운영 알림 추가",
      "링크 속도가 1000Mb/s 미만으로 협상될 경우 점검 알림 추가",
      "장애 대응 시 포트, 랜선, NIC 상태를 함께 확인하는 체크리스트 작성",
      "검증된 CAT5e 또는 CAT6 이상 Ethernet 랜선 여분 확보",
    ],
    exitCriteria:
      "리버스 프록시 서버에서 Link detected yes, 1000Mb/s Full Duplex 상태가 지속되고 외부 접근 경로 확인이 완료되어야 종료",
  },
  tags: [
    "#incident",
    "#sev-3",
    "#reverse-proxy",
    "#nic",
    "#ethernet",
    "#cable",
    "#ethtool",
    "#network",
  ],
};
