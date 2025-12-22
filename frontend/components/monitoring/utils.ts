/**
 * 모니터링 관련 유틸리티 함수
 */

const ALIAS_MAP: Record<string, string> = {
  ".nangman.cloud": "@NC",
  "-ubuntu-server": "-SRV",
  "nginx-proxy-manager": "NGINX-PM",
  "reverse-proxy": "R-PROXY",
  "teleport-access": "TELE-ACC",
  "windows-managements": "WIN-MGMT",
  "analytics": "ANLYTCS",
};

/**
 * 모니터 이름을 짧은 별칭으로 변환
 */
export function getSmartName(name: string): string {
  let smartName = name;
  Object.entries(ALIAS_MAP).forEach(([key, val]) => {
    smartName = smartName.replace(new RegExp(key, "gi"), val);
  });
  return smartName;
}

