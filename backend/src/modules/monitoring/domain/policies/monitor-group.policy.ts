/**
 * 수동 그룹 매핑 (5-Layer Hierarchical Structure)
 * 서버 이름을 계층 구조에 맞게 매핑
 */
const MANUAL_GROUP_MAP: Readonly<Record<string, string>> = {
  // 1. Network Layer (네트워크 계층)
  OPNsense: 'Network Layer',
  'Teleport Console': 'Network Layer',
  'ec2-nangman-teleport-access': 'Network Layer',
  'seongwon-nginx-proxy-manager': 'Network Layer',
  'wisoft-nginx-reverse-proxy': 'Network Layer',
  // 네트워크 장비
  'UniFi Networks': 'Network Layer',
  'UniFi Security Gateway': 'Network Layer',
  'TPLINK-ER7206': 'Network Layer',

  // 2. Infrastructure Layer (인프라 계층)
  'XCP-ng': 'Infrastructure Layer',
  'donggeon-ubuntu-server': 'Infrastructure Layer',
  'heehoon-ubuntu-server': 'Infrastructure Layer',
  'juhyung-ubuntu-server': 'Infrastructure Layer',
  'junho-ubuntu-server': 'Infrastructure Layer',
  'seongwoo-ubuntu-server': 'Infrastructure Layer',
  'taekjun-ubuntu-server': 'Infrastructure Layer',
  'wisoft-nangman-build-server': 'Infrastructure Layer',
  'rustfs.nangman.cloud': 'Infrastructure Layer',

  // 3. Platform Services (플랫폼 서비스)
  Authentik: 'Platform Services',
  grafana: 'Platform Services',
  'analytics.nangman.cloud': 'Platform Services',
  'ec2-nangman-managements': 'Platform Services',
  'wisoft windows managements': 'Platform Services',
  jenkins: 'Platform Services',
  'harbor.nangman.cloud': 'Platform Services',

  // 4. Applications (애플리케이션)
  'nangman.cloud': 'Applications',
  'ban-o.art': 'Applications',
  'netlab.wisoft.io': 'Applications',
  'skt-hack.wisoft.io': 'Applications',
  'wisoft-seongwon-app-server': 'Applications',
  'matrix.nangman.cloud': 'Applications',
  'matrixrtc.nangman.cloud': 'Applications',
  'element-call': 'Applications',
  'livekit.nangman.cloud': 'Applications',
  Mattermost: 'Applications',

  // 5. External Services (외부 서비스)
  'Google DNS': 'External Services',
  'CloudFlare DNS': 'External Services',
} as const;

export function determineMonitorGroup(monitorName: string): string {
  return MANUAL_GROUP_MAP[monitorName] || classifyByPattern(monitorName);
}

/**
 * 패턴 기반 자동 분류 함수
 * 수동 매핑에 없는 서버를 계층 구조에 맞게 자동 분류
 * 우선순위: External Services > Network Layer > Infrastructure Layer > Applications > Platform Services
 */
function classifyByPattern(monitorName: string): string {
  const nameLower = monitorName.toLowerCase();

  // 우선순위에 따라 분류
  if (isExternalService(nameLower)) {
    return 'External Services';
  }
  if (isNetworkLayer(nameLower)) {
    return 'Network Layer';
  }
  if (isInfrastructureLayer(nameLower, monitorName)) {
    return 'Infrastructure Layer';
  }
  if (isApplication(nameLower, monitorName)) {
    return 'Applications';
  }
  if (isPlatformService(nameLower)) {
    return 'Platform Services';
  }
  // 기본값: Platform Services
  return 'Platform Services';
}

function isPlatformService(nameLower: string): boolean {
  // 인증/권한 관리
  if (
    nameLower.includes('authentik') ||
    nameLower.includes('auth') ||
    nameLower.includes('ldap') ||
    nameLower.includes('sso')
  ) {
    return true;
  }

  // 모니터링/분석
  if (
    nameLower.includes('grafana') ||
    nameLower.includes('analytics') ||
    nameLower.includes('prometheus') ||
    nameLower.includes('zabbix') ||
    nameLower.includes('nagios') ||
    nameLower.includes('monitoring')
  ) {
    return true;
  }

  // CI/CD 도구
  if (
    nameLower.includes('jenkins') ||
    nameLower.includes('gitlab') ||
    nameLower.includes('github') ||
    nameLower.includes('ci/cd') ||
    nameLower.includes('pipeline')
  ) {
    return true;
  }

  // 컨테이너 레지스트리
  if (
    nameLower.includes('harbor') ||
    nameLower.includes('registry') ||
    nameLower.includes('docker-registry')
  ) {
    return true;
  }

  // 관리 서버
  return (
    nameLower.includes('management') ||
    nameLower.includes('managements') ||
    nameLower.includes('console.nangman.cloud') ||
    nameLower.includes('admin')
  );
}

function isExternalService(nameLower: string): boolean {
  return (
    nameLower.includes('dns') ||
    nameLower.includes('google') ||
    nameLower.includes('cloudflare') ||
    nameLower.includes('external')
  );
}

function isNetworkLayer(nameLower: string): boolean {
  // 네트워크 장비 브랜드/제품
  if (
    nameLower.includes('unifi') ||
    nameLower.includes('tplink') ||
    nameLower.includes('tp-link') ||
    nameLower.includes('opnsense')
  ) {
    return true;
  }

  // 네트워크 기능
  return (
    nameLower.includes('teleport') ||
    nameLower.includes('nginx') ||
    nameLower.includes('proxy') ||
    nameLower.includes('reverse-proxy') ||
    nameLower.includes('gateway') ||
    nameLower.includes('firewall') ||
    nameLower.includes('router') ||
    nameLower.includes('switch') ||
    nameLower.includes('ap-') ||
    nameLower.includes('access-point') ||
    nameLower.includes('wifi') ||
    nameLower.includes('wireless')
  );
}

function isInfrastructureLayer(
  nameLower: string,
  monitorName: string,
): boolean {
  // 하이퍼바이저
  if (
    nameLower.includes('xcp') ||
    nameLower.includes('hypervisor') ||
    nameLower.includes('vmware') ||
    nameLower.includes('proxmox')
  ) {
    return true;
  }

  // 서버 패턴 (정확한 매칭)
  if (
    /-ubuntu-server$/i.test(monitorName) ||
    /ubuntu.*server$/i.test(monitorName)
  ) {
    return true;
  }

  // 빌드/컴파일 서버
  if (nameLower.includes('build-server') || nameLower.includes('build')) {
    return true;
  }

  // 스토리지/파일 서버
  if (
    nameLower.includes('rustfs') ||
    nameLower.includes('storage') ||
    nameLower.includes('nas') ||
    nameLower.includes('fileserver')
  ) {
    return true;
  }

  // EC2 인스턴스 (인프라)
  if (nameLower.includes('ec2') && nameLower.includes('server')) {
    return true;
  }

  // 일반 서버 (단, app-server, managements 제외)
  return (
    nameLower.includes('server') &&
    !nameLower.includes('app-server') &&
    !nameLower.includes('management')
  );
}

function isApplication(nameLower: string, monitorName: string): boolean {
  // 협업 도구
  if (
    nameLower.includes('matrix') ||
    nameLower.includes('element') ||
    nameLower.includes('livekit') ||
    nameLower.includes('mattermost') ||
    nameLower.includes('slack') ||
    nameLower.includes('discord')
  ) {
    return true;
  }

  // 앱 서버
  if (nameLower.includes('app-server')) {
    return true;
  }

  // 도메인 패턴 (단, console.nangman.cloud, analytics 제외)
  if (
    /\.(cloud|art|io|com|net|org)$/i.test(monitorName) &&
    !nameLower.includes('console.nangman.cloud') &&
    !nameLower.includes('analytics') &&
    !nameLower.includes('harbor') &&
    !nameLower.includes('grafana')
  ) {
    return true;
  }

  // 일반 웹사이트/서비스
  return (
    nameLower.includes('website') ||
    nameLower.includes('webapp') ||
    nameLower.includes('app.')
  );
}
