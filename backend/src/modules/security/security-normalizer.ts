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
          ...new Array<string>(8 - left.length - right.length).fill('0'),
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
    .replaceAll(/https?:\/\/\S+/gi, '[url]')
    .replaceAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]')
    .replaceAll(/[a-f\d:.]+/gi, redactIpv6Token)
    .replaceAll(/\S+/g, redactEmailToken)
    .replaceAll(/[\u0000-\u001f\u007f]/g, ' ')
    .slice(0, 180);
}

function redactIpv6Token(token: string): string {
  const firstColon = token.indexOf(':');
  const secondColon = token.indexOf(':', firstColon + 1);
  return firstColon !== -1 && secondColon !== -1 ? '[ip]' : token;
}

function redactEmailToken(token: string): string {
  const at = token.lastIndexOf('@');
  if (at <= 0) return token;
  const dot = token.indexOf('.', at + 2);
  return dot !== -1 && dot < token.length - 1 ? '[email]' : token;
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

interface NormalizationOptions {
  wanInterfaces: Set<string>;
  protectedAddresses: Set<string>;
  offset: string;
}

const SOURCE_FIELDS = {
  ids: {
    origin: 'src_ip',
    destination: 'dest_ip',
    timestamp: 'timestamp',
    port: 'dest_port',
    protocol: 'proto',
  },
  firewall: {
    origin: 'src',
    destination: 'dst',
    timestamp: '__timestamp__',
    port: 'dstport',
    protocol: 'protoname',
  },
} as const;

function isIncludedEvent(
  source: SecurityEvent['source'],
  raw: RawRecord,
  destination: string,
  options: NormalizationOptions,
): boolean {
  if (source === 'ids') {
    return (
      isPrivateAddress(destination) ||
      options.protectedAddresses.has(destination)
    );
  }
  return (
    raw.action === 'block' &&
    raw.dir === 'in' &&
    options.wanInterfaces.has(text(raw.interface))
  );
}

function destinationPort(value: unknown): number | null {
  if (value === null || value === undefined || text(value) === '') return null;
  const port = Number(value);
  return Number.isInteger(port) && port >= 0 && port <= 65535 ? port : null;
}

function eventIdentity(
  source: SecurityEvent['source'],
  raw: RawRecord,
  sourceIp: string,
  destination: string,
  port: number | null,
): unknown[] {
  if (source === 'firewall' && raw.__digest__) return [source, raw.__digest__];
  return [
    source,
    raw[SOURCE_FIELDS[source].timestamp],
    raw.flow_id,
    raw.alert_sid,
    sourceIp,
    destination,
    raw.src_port ?? raw.srcport,
    port,
    raw.proto ?? raw.protoname,
    raw.seq,
  ];
}

export function normalizeEvent(
  source: SecurityEvent['source'],
  raw: RawRecord,
  countryFor: (ip: string) => string,
  options: NormalizationOptions,
): SecurityEvent | null {
  const fields = SOURCE_FIELDS[source];
  const sourceIp = text(raw[fields.origin]);
  const destination = text(raw[fields.destination]);
  if (
    !isPublicAddress(sourceIp) ||
    !isIncludedEvent(source, raw, destination, options)
  )
    return null;
  const timestamp = parseEventTime(raw[fields.timestamp], options.offset);
  if (timestamp === null) return null;
  const port = destinationPort(raw[fields.port]);
  const signature =
    source === 'ids' ? publicSignature(raw.alert) : 'Firewall policy';
  const identity = eventIdentity(source, raw, sourceIp, destination, port);
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
      text(raw[fields.protocol])
        .toUpperCase()
        .replaceAll(/[^A-Z0-9]/g, '')
        .slice(0, 12) || 'OTHER',
    port,
  };
}
