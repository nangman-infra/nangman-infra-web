import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import type { SecurityEvent } from './security.types';

export type RawRecord = Record<string, unknown>;

export function ipNumber(
  input: string,
): { version: number; value: bigint } | null {
  const version = isIP(input);
  if (version === 4) {
    return {
      version,
      value: input
        .split('.')
        .reduce((value, part) => (value << 8n) + BigInt(part), 0n),
    };
  }
  if (version !== 6) return null;
  let expanded = input.toLowerCase();
  if (expanded.includes('.')) {
    const split = expanded.lastIndexOf(':');
    const ipv4 = ipNumber(expanded.slice(split + 1));
    if (!ipv4) return null;
    expanded = `${expanded.slice(0, split)}:${(ipv4.value >> 16n).toString(16)}:${(ipv4.value & 65535n).toString(16)}`;
  }
  const halves = expanded.split('::');
  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves[1] ? halves[1].split(':') : [];
  const parts =
    halves.length === 2
      ? [
          ...left,
          ...Array<string>(8 - left.length - right.length).fill('0'),
          ...right,
        ]
      : left;
  const value = parts.reduce(
    (result, part) => (result << 16n) + BigInt(`0x${part || '0'}`),
    0n,
  );
  if (value >> 32n === 65535n)
    return { version: 4, value: value & 0xffffffffn };
  return { version, value };
}

export function isPrivateAddress(ip: string): boolean {
  const parsed = ipNumber(ip);
  if (!parsed) return false;
  if (parsed.version === 6) return parsed.value >> 121n === 126n;
  const number = Number(parsed.value);
  return (
    number >>> 24 === 10 || number >>> 20 === 0xac1 || number >>> 16 === 0xc0a8
  );
}

export function isPublicAddress(ip: string): boolean {
  const parsed = ipNumber(ip);
  if (!parsed || isPrivateAddress(ip)) return false;
  if (parsed.version === 6) {
    // Only global unicast. Local, multicast, documentation and unspecified
    // addresses must never become geographic "origins" on the public map.
    return parsed.value >> 125n === 1n && parsed.value >> 96n !== 0x20010db8n;
  }
  const n = Number(parsed.value);
  const first = n >>> 24;
  return (
    first !== 0 &&
    first !== 127 &&
    first < 224 &&
    n >>> 16 !== 0xa9fe &&
    n >>> 22 !== 0x191 &&
    n >>> 17 !== 0x6309 &&
    n >>> 8 !== 0xc00000 &&
    n >>> 8 !== 0xc00002 &&
    n >>> 8 !== 0xc63364 &&
    n >>> 8 !== 0xcb0071
  );
}

export function parseEventTime(
  value: unknown,
  offset = '+09:00',
): number | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  let text = value.trim().replace(' ', 'T');
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)) text += offset;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

export function publicSignature(value: unknown): string {
  return text(value)
    .replace(/https?:\/\/\S+/gi, '[url]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]')
    .replace(/\b(?:[a-f0-9]{0,4}:){2,}[a-f0-9:.]*\b/gi, '[ip]')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .slice(0, 180);
}

export function signatureCategory(value: string): string {
  const signature = value.toUpperCase();
  if (/\b(DROP|CINS|DSHIELD|SPAMHAUS)\b/.test(signature)) return 'Reputation';
  if (/\b(SCAN|SCANNER)\b/.test(signature)) return 'Scanning';
  if (/\b(EXPLOIT|SHELLCODE)\b/.test(signature)) return 'Exploit';
  if (/\b(MALWARE|TROJAN|BOTNET|COMPROMISED)\b/.test(signature))
    return 'Malware';
  if (/\b(WEB_SERVER|WEB_SPECIFIC_APPS|XSS|SQL)\b/.test(signature))
    return 'Web';
  if (/\bDNS\b/.test(signature)) return 'DNS';
  if (/\b(USER_AGENTS|POLICY|INFO)\b/.test(signature)) return 'Policy';
  return 'Other';
}

export function normalizeEvent(
  source: 'ids' | 'firewall',
  raw: RawRecord,
  countryFor: (ip: string) => string,
  options: {
    wanInterfaces: Set<string>;
    protectedAddresses: Set<string>;
    offset: string;
  },
): SecurityEvent | null {
  const sourceIp = text(source === 'ids' ? raw.src_ip : raw.src);
  if (!isPublicAddress(sourceIp)) return null;
  const destination = text(source === 'ids' ? raw.dest_ip : raw.dst);
  if (source === 'ids') {
    if (
      !isPrivateAddress(destination) &&
      !options.protectedAddresses.has(destination)
    )
      return null;
  } else if (
    raw.action !== 'block' ||
    raw.dir !== 'in' ||
    !options.wanInterfaces.has(text(raw.interface))
  ) {
    return null;
  }
  const timestampValue = source === 'ids' ? raw.timestamp : raw.__timestamp__;
  const timestamp = parseEventTime(timestampValue, options.offset);
  if (timestamp === null) return null;
  const portValue = source === 'ids' ? raw.dest_port : raw.dstport;
  const parsedPort = Number(portValue);
  const port =
    portValue !== null &&
    portValue !== undefined &&
    text(portValue) !== '' &&
    Number.isInteger(parsedPort) &&
    parsedPort >= 0 &&
    parsedPort <= 65535
      ? parsedPort
      : null;
  const signature =
    source === 'ids' ? publicSignature(raw.alert) : 'Firewall policy';
  const identity =
    source === 'firewall' && raw.__digest__
      ? [source, raw.__digest__]
      : [
          source,
          timestampValue,
          raw.flow_id,
          raw.alert_sid,
          sourceIp,
          destination,
          raw.src_port ?? raw.srcport,
          port,
          raw.proto ?? raw.protoname,
          raw.seq,
        ];
  return {
    id: createHash('sha256').update(JSON.stringify(identity)).digest('hex'),
    timestamp,
    source,
    action:
      source === 'firewall' || raw.alert_action === 'blocked'
        ? 'blocked'
        : 'detected',
    country: countryFor(sourceIp) || 'ZZ',
    category: source === 'ids' ? signatureCategory(signature) : 'Firewall',
    signature,
    protocol:
      text(source === 'ids' ? raw.proto : raw.protoname)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 12) || 'OTHER',
    port,
  };
}
