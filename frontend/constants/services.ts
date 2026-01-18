/**
 * 서비스 관련 상수 정의
 * 가이드라인: Magic Number를 상수로 정의하여 유지보수성 향상
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string; // Simple Icons 아이콘 이름 (옵셔널)
  url?: string; // 단일 URL 또는 다중 URL 선택 시 첫 번째 URL
  urls?: Array<{ label: string; url: string }>; // 다중 URL 선택 시 사용
  category: 'monitoring' | 'automation' | 'security' | 'infrastructure' | 'communication' | 'storage';
}

/**
 * 서비스 목록
 * 운영 중인 서비스에 대한 통합 접근 정보
 */
export const SERVICES: Service[] = [
  {
    id: 'ansible',
    name: 'Ansible',
    description: '자동화 및 구성 관리',
    icon: 'ansible',
    url: 'https://ansible-awx.console.nangman.cloud',
    category: 'automation',
  },
  {
    id: 'authentik',
    name: 'Authentik',
    description: '인증 및 권한 관리',
    icon: 'authentik',
    url: 'https://auth.nangman.cloud',
    category: 'security',
  },
  {
    id: 'docmost',
    name: 'Docmost',
    description: '문서 관리 및 협업',
    icon: 'docmost.png',
    url: 'https://docmost.console.nangman.cloud',
    category: 'communication',
  },
  {
    id: 'element',
    name: 'Element',
    description: '실시간 메시징 및 협업',
    icon: 'matrix', // Element는 Matrix 프로토콜 사용
    url: 'https://meet.console.nangman.cloud',
    category: 'communication',
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: '시각화 및 모니터링 대시보드',
    icon: 'grafana',
    url: 'https://grafana.console.nangman.cloud',
    category: 'monitoring',
  },
  {
    id: 'harbor',
    name: 'Harbor',
    description: '컨테이너 이미지 레지스트리',
    icon: 'harbor',
    url: 'https://harbor.nangman.cloud',
    category: 'infrastructure',
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    description: 'CI/CD 파이프라인',
    icon: 'jenkins',
    url: 'https://jenkins.console.nangman.cloud',
    category: 'automation',
  },
  {
    id: 'nginx-proxy-manager',
    name: 'NGINX Proxy Manager',
    description: '리버스 프록시 관리',
    icon: 'nginxproxymanager',
    urls: [
      { label: '서울 IDC', url: 'https://seongwon-nginx-proxy-manager.console.nangman.cloud' },
      { label: '대전 IDC', url: 'https://wisoft-nginx-proxy-manager.console.nangman.cloud' },
    ],
    category: 'infrastructure',
  },
  {
    id: 'opnsense',
    name: 'OPNsense',
    description: '방화벽 및 라우터',
    icon: 'opnsense',
    url: 'https://opnsense.console.nangman.cloud',
    category: 'security',
  },
  {
    id: 'rustfs',
    name: 'RustFS',
    description: '파일 서버',
    icon: 'rustfs.svg',
    category: 'storage',
  },
  {
    id: 'rybbit',
    name: 'Rybbit',
    description: '웹 및 제품 분석',
    icon: 'rybbit.png',
    url: 'https://analytics.nangman.cloud',
    category: 'monitoring',
  },
  {
    id: 'synology',
    name: 'Synology',
    description: '네트워크 스토리지',
    icon: 'synology',
    url: 'https://synology-nas.console.nangman.cloud',
    category: 'storage',
  },
  {
    id: 'uptime-kuma',
    name: 'Uptime Kuma',
    description: '서비스 가용성 모니터링',
    icon: 'uptimekuma',
    url: 'https://uptime-kuma.console.nangman.cloud',
    category: 'monitoring',
  },
  {
    id: 'wazuh',
    name: 'Wazuh',
    description: '보안 정보 및 이벤트 관리',
    icon: 'wazuh.png',
    url: 'https://wazuh.console.nangman.cloud',
    category: 'security',
  },
  {
    id: 'zabbix',
    name: 'Zabbix',
    description: '네트워크 모니터링',
    icon: 'zabbix.svg',
    url: 'https://zabbix.console.nangman.cloud',
    category: 'monitoring',
  },
  {
    id: 'sonarqube',
    name: 'SonarQube',
    description: '코드 품질 분석',
    icon: 'sonarqube',
    category: 'automation',
  },
] as const;

// 카테고리별 그룹화를 위한 상수
export const SERVICE_CATEGORIES = [
  'monitoring',
  'automation',
  'security',
  'infrastructure',
  'communication',
  'storage',
] as const;

// 카테고리 라벨 매핑
export const CATEGORY_LABELS: Record<Service['category'], string> = {
  monitoring: '모니터링',
  automation: '자동화',
  security: '보안',
  infrastructure: '인프라',
  communication: '커뮤니케이션',
  storage: '스토리지',
};
