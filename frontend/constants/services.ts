/**
 * 서비스 관련 상수 정의
 * 가이드라인: Magic Number를 상수로 정의하여 유지보수성 향상
 */
import type { AppLocale } from "@/i18n/routing";

type LocalizedText = Record<AppLocale, string>;

export type ServiceCategory =
  | 'monitoring'
  | 'automation'
  | 'security'
  | 'infrastructure'
  | 'communication'
  | 'storage';

export interface Service {
  id: string;
  name: string;
  description: LocalizedText;
  icon?: string; // Simple Icons 아이콘 이름 (옵셔널)
  url?: string; // 단일 URL 또는 다중 URL 선택 시 첫 번째 URL
  urls?: Array<{ label: LocalizedText; url: string }>; // 다중 URL 선택 시 사용
  category: ServiceCategory;
}

/**
 * 서비스 목록
 * 운영 중인 서비스에 대한 통합 접근 정보
 */
export const SERVICES: Service[] = [
  {
    id: 'ansible',
    name: 'Ansible',
    description: {
      ko: '자동화 및 구성 관리',
      en: 'Automation and configuration management',
    },
    icon: 'ansible',
    url: 'https://ansible-awx.console.nangman.cloud',
    category: 'automation',
  },
  {
    id: 'aws',
    name: 'AWS',
    description: {
      ko: '클라우드 서비스 및 계정 접근',
      en: 'Cloud service and account access',
    },
    icon: 'amazonaws',
    url: 'https://d-9b6755b1ab.awsapps.com/start',
    category: 'infrastructure',
  },
  {
    id: 'authentik',
    name: 'Authentik',
    description: {
      ko: '인증 및 권한 관리',
      en: 'Authentication and access management',
    },
    icon: 'authentik',
    url: 'https://auth.nangman.cloud',
    category: 'security',
  },
  {
    id: 'phase',
    name: 'Phase',
    description: {
      ko: '시크릿 및 환경 변수 관리',
      en: 'Secrets and environment variable management',
    },
    icon: 'phase.svg',
    url: 'https://secrets.nangman.cloud',
    category: 'security',
  },
  {
    id: 'outline',
    name: 'Outline',
    description: {
      ko: '문서 관리 및 협업 워크스페이스',
      en: 'Documentation and collaboration workspace',
    },
    icon: 'outline.svg',
    url: 'https://docs.console.nangman.cloud',
    category: 'communication',
  },
  {
    id: 'transnote',
    name: 'Transnote',
    description: {
      ko: 'AI 회의 기록 및 노트 워크스페이스',
      en: 'AI meeting notes and workspace',
    },
    icon: 'transnote.svg',
    url: 'https://transnote.nangman.cloud/',
    category: 'communication',
  },
  {
    id: 'element',
    name: 'Element',
    description: {
      ko: '실시간 메시징 및 협업',
      en: 'Real-time messaging and collaboration',
    },
    icon: 'matrix', // Element는 Matrix 프로토콜 사용
    url: 'https://meet.console.nangman.cloud',
    category: 'communication',
  },
  {
    id: 'mattermost',
    name: 'Mattermost',
    description: {
      ko: '오픈소스 협업 플랫폼',
      en: 'Open-source collaboration platform',
    },
    icon: 'mattermost',
    url: 'https://mattermost.nangman.cloud',
    category: 'communication',
  },
  {
    id: 'huly',
    name: 'Huly',
    description: {
      ko: '태스크 및 티켓 워크플로우 관리',
      en: 'Task and ticket workflow management',
    },
    icon: 'huly-workflow.svg',
    url: 'https://now.nangman.cloud',
    category: 'communication',
  },
  {
    id: 'mail',
    name: 'Mail',
    description: {
      ko: '웹 메일 서비스',
      en: 'Web mail service',
    },
    icon: 'mail.svg',
    url: 'https://mail.console.nangman.cloud',
    category: 'communication',
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: {
      ko: '시각화 및 모니터링 대시보드',
      en: 'Visualization and monitoring dashboard',
    },
    icon: 'grafana',
    url: 'https://grafana.console.nangman.cloud',
    category: 'monitoring',
  },
  {
    id: 'harbor',
    name: 'Harbor',
    description: {
      ko: '컨테이너 이미지 레지스트리',
      en: 'Container image registry',
    },
    icon: 'harbor',
    url: 'https://harbor.nangman.cloud',
    category: 'infrastructure',
  },
  {
    id: 'directus',
    name: 'Directus',
    description: {
      ko: '헤드리스 CMS 및 콘텐츠 관리',
      en: 'Headless CMS and content management',
    },
    icon: 'directus',
    url: 'https://directus.console.nangman.cloud',
    category: 'infrastructure',
  },
  {
    id: 'coder',
    name: 'Coder',
    description: {
      ko: '클라우드 개발 워크스페이스',
      en: 'Cloud development workspace',
    },
    icon: 'visualstudiocode',
    url: 'https://coder.nangman.cloud',
    category: 'infrastructure',
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    description: {
      ko: 'CI/CD 파이프라인',
      en: 'CI/CD pipeline',
    },
    icon: 'jenkins',
    url: 'https://jenkins.nangman.cloud/',
    category: 'automation',
  },
  {
    id: 'nginx-proxy-manager',
    name: 'NGINX Proxy Manager',
    description: {
      ko: '리버스 프록시 관리',
      en: 'Reverse proxy management',
    },
    icon: 'nginxproxymanager',
    urls: [
      {
        label: { ko: '서울 IDC', en: 'Seoul IDC' },
        url: 'https://seongwon-nginx-proxy-manager.console.nangman.cloud',
      },
      {
        label: { ko: '대전 IDC', en: 'Daejeon IDC' },
        url: 'https://wisoft-nginx-proxy-manager.console.nangman.cloud',
      },
    ],
    category: 'infrastructure',
  },
  {
    id: 'opnsense',
    name: 'OPNsense',
    description: {
      ko: '방화벽 및 라우터',
      en: 'Firewall and router',
    },
    icon: 'opnsense',
    url: 'https://opnsense.console.nangman.cloud',
    category: 'security',
  },
  {
    id: 'rustfs',
    name: 'RustFS',
    description: {
      ko: '파일 서버',
      en: 'File storage server',
    },
    icon: 'rustfs.svg',
    url: 'https://rustfs.nangman.cloud/rustfs/console/auth/login',
    category: 'storage',
  },
  {
    id: 'rybbit',
    name: 'Rybbit',
    description: {
      ko: '웹 및 제품 분석',
      en: 'Web and product analytics',
    },
    icon: 'rybbit.png',
    url: 'https://analytics.nangman.cloud',
    category: 'monitoring',
  },
  {
    id: 'synology',
    name: 'Synology',
    description: {
      ko: '네트워크 스토리지',
      en: 'Network-attached storage',
    },
    icon: 'synology',
    url: 'https://synology-nas.console.nangman.cloud',
    category: 'storage',
  },
  {
    id: 'uptime-kuma',
    name: 'Uptime Kuma',
    description: {
      ko: '서비스 가용성 모니터링',
      en: 'Service availability monitoring',
    },
    icon: 'uptimekuma',
    url: 'https://uptime-kuma.console.nangman.cloud',
    category: 'monitoring',
  },
  {
    id: 'wazuh',
    name: 'Wazuh',
    description: {
      ko: '보안 정보 및 이벤트 관리',
      en: 'Security information and event management',
    },
    icon: 'wazuh.png',
    url: 'https://wazuh.console.nangman.cloud',
    category: 'security',
  },
  {
    id: 'zabbix',
    name: 'Zabbix',
    description: {
      ko: '네트워크 모니터링',
      en: 'Network monitoring',
    },
    icon: 'zabbix.svg',
    url: 'https://zabbix.console.nangman.cloud',
    category: 'monitoring',
  },
  {
    id: 'sonarqube',
    name: 'SonarQube',
    description: {
      ko: '코드 품질 분석',
      en: 'Code quality analysis',
    },
    icon: 'sonarqube',
    url: 'https://sonarqube.nangman.cloud',
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
export const CATEGORY_LABELS: Record<ServiceCategory, LocalizedText> = {
  monitoring: { ko: '모니터링', en: 'Monitoring' },
  automation: { ko: '자동화', en: 'Automation' },
  security: { ko: '보안', en: 'Security' },
  infrastructure: { ko: '인프라', en: 'Infrastructure' },
  communication: { ko: '협업', en: 'Collaboration' },
  storage: { ko: '스토리지', en: 'Storage' },
};

export function getLocalizedText(
  locale: AppLocale,
  value: LocalizedText,
): string {
  return value[locale];
}
