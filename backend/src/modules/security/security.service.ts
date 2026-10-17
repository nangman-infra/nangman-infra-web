import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAbsolute } from 'node:path';
import { GeoIpLookup } from './geoip.lookup';
import { OpnsenseReader, SecurityReadError } from './opnsense.reader';
import {
  normalizeEvent,
  parseEventTime,
  RawRecord,
} from './security-normalizer';
import { buildSecuritySnapshot } from './security-snapshot';
import type {
  SecurityEvent,
  SecurityFilter,
  SecuritySnapshot,
  SecuritySource,
  SecuritySourceState,
} from './security.types';

function interfaceDescription(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const description = (value as RawRecord).description;
  return typeof description === 'string' ? description : '';
}

function engineStatus(value: unknown): SecuritySnapshot['engine']['status'] {
  if (value === 'running' || value === 'stopped') return value;
  return null;
}

@Injectable()
export class SecurityService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SecurityService.name);
  private reader: OpnsenseReader | null = null;
  private geo = new GeoIpLookup();
  private pending: Promise<void> | null = null;
  private lastAttempt = 0;
  private lastRulesetRead = 0;
  private stopped = false;
  // Successful reads replace their entire snapshot. No disk writes or event history.
  private readonly events: Record<SecuritySource, SecurityEvent[]> = {
    ids: [],
    firewall: [],
  };
  private readonly states: Record<SecuritySource, SecuritySourceState> = {
    ids: this.initialState('ids', 5000),
    firewall: this.initialState('firewall', 1000),
  };
  private readonly engine: SecuritySnapshot['engine'] = {
    status: null,
    enabledRulesets: null,
  };
  private readonly options = {
    wanInterfaces: new Set<string>(),
    protectedAddresses: new Set<string>(),
    offset: '+09:00',
  };

  constructor(private readonly config: ConfigService) {}

  private initialState(
    source: SecuritySource,
    limit: number,
  ): SecuritySourceState {
    return {
      source,
      limit,
      lastSuccess: null,
      oldest: null,
      newest: null,
      received: 0,
      matched: 0,
      stale: true,
      error: null,
    };
  }

  onModuleInit(): void {
    const url = this.config.get<string>('SECURITY_OPNSENSE_URL');
    const key = this.config.get<string>('SECURITY_OPNSENSE_CREDENTIALS_FILE');
    const ca = this.config.get<string>('SECURITY_OPNSENSE_CA_FILE');
    const fingerprint = this.config.get<string>(
      'SECURITY_OPNSENSE_CERT_SHA256',
    );
    if (!url || !key || !ca || !fingerprint) return;
    try {
      const geoPath = this.config.get<string>('SECURITY_GEOIP_FILE');
      if (![key, ca, ...(geoPath ? [geoPath] : [])].every(isAbsolute)) {
        throw new SecurityReadError('configuration');
      }
      const offset =
        this.config.get<string>('SECURITY_SOURCE_UTC_OFFSET') ?? '+09:00';
      if (!/^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(offset))
        throw new SecurityReadError('configuration');
      this.options.offset = offset;
      this.options.wanInterfaces = new Set(
        (this.config.get<string>('SECURITY_WAN_INTERFACES') ?? '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      );
      this.options.protectedAddresses = new Set(
        (this.config.get<string>('SECURITY_PROTECTED_ADDRESSES') ?? '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      );
      this.geo = new GeoIpLookup(geoPath);
      this.reader = new OpnsenseReader(url, key, ca, fingerprint);
    } catch {
      this.reader?.close();
      this.reader = null;
      this.states.ids.error = 'configuration';
      this.states.firewall.error = 'configuration';
      this.logger.warn('Security data source configuration is unavailable.');
    }
  }

  private async discoverWanInterfaces(reader: OpnsenseReader): Promise<void> {
    if (this.options.wanInterfaces.size) return;
    const names = await reader.read<RawRecord>(
      '/api/diagnostics/interface/get_interface_names',
    );
    for (const [device, value] of Object.entries(names)) {
      if (/\bwan\b/i.test(interfaceDescription(value)) || device === 'wan')
        this.options.wanInterfaces.add(device);
    }
    if (!this.options.wanInterfaces.size)
      throw new SecurityReadError('configuration');
  }

  private async sourceRows(
    reader: OpnsenseReader,
    source: SecuritySource,
  ): Promise<RawRecord[]> {
    const result =
      source === 'ids'
        ? await reader.read<{ rows?: RawRecord[] }>(
            '/api/ids/service/query_alerts',
            { current: 1, rowCount: 5000, searchPhrase: '' },
          )
        : await reader.read<RawRecord[]>('/api/diagnostics/firewall/log');
    const rows = Array.isArray(result) ? result : result.rows;
    if (!Array.isArray(rows)) throw new SecurityReadError('connection');
    return rows
      .filter((row) => row && typeof row === 'object')
      .slice(0, this.states[source].limit);
  }

  private replaceSourceSnapshot(
    source: SecuritySource,
    rows: RawRecord[],
  ): void {
    const now = Date.now();
    const timestampField = source === 'ids' ? 'timestamp' : '__timestamp__';
    const times = rows
      .map((row) => parseEventTime(row[timestampField], this.options.offset))
      .filter((time): time is number => time !== null && time <= now + 60_000);
    const unique = new Map<string, SecurityEvent>();
    for (const row of rows) {
      const event = normalizeEvent(
        source,
        row,
        (ip) => this.geo.lookup(ip),
        this.options,
      );
      if (event && event.timestamp <= now + 60_000) unique.set(event.id, event);
    }
    this.events[source] = [...unique.values()];
    this.states[source] = {
      source,
      limit: this.states[source].limit,
      lastSuccess: new Date(now).toISOString(),
      oldest: times.length ? new Date(Math.min(...times)).toISOString() : null,
      newest: times.length ? new Date(Math.max(...times)).toISOString() : null,
      received: rows.length,
      matched: unique.size,
      stale: false,
      error: null,
    };
  }

  private async readSource(source: SecuritySource): Promise<void> {
    if (!this.reader || this.stopped) return;
    try {
      if (source === 'firewall') await this.discoverWanInterfaces(this.reader);
      const rows = await this.sourceRows(this.reader, source);
      if (!this.stopped) this.replaceSourceSnapshot(source, rows);
    } catch (error) {
      this.states[source].error =
        error instanceof SecurityReadError ? error.kind : 'connection';
    }
  }

  private async readEngine(): Promise<void> {
    if (!this.reader || this.stopped) return;
    try {
      const result = await this.reader.read<{ status?: string }>(
        '/api/ids/service/status',
      );
      this.engine.status = engineStatus(result.status);
    } catch {
      this.engine.status = null;
    }
    if (Date.now() - this.lastRulesetRead < 600_000 || this.stopped) return;
    this.lastRulesetRead = Date.now();
    try {
      const rules = await this.reader.read<{ rows?: RawRecord[] }>(
        '/api/ids/settings/list_rulesets',
      );
      this.engine.enabledRulesets = Array.isArray(rules.rows)
        ? rules.rows.filter((row) => String(row.enabled) === '1').length
        : null;
    } catch {
      this.engine.enabledRulesets = null;
    }
  }

  async snapshot(filter: SecurityFilter): Promise<SecuritySnapshot> {
    // Coalesce concurrent visitors and share one transient result for ten seconds.
    if (
      this.reader &&
      !this.stopped &&
      !this.pending &&
      Date.now() - this.lastAttempt >= 10_000
    ) {
      this.lastAttempt = Date.now();
      this.pending = Promise.all([
        this.readSource('ids'),
        this.readSource('firewall'),
        this.readEngine(),
      ])
        .then(() => undefined)
        .finally(() => {
          this.pending = null;
        });
    }
    if (this.pending) await this.pending;
    return buildSecuritySnapshot(
      [...this.events.ids, ...this.events.firewall],
      Object.values(this.states),
      filter,
      this.reader !== null,
      this.geo.available,
      this.engine,
    );
  }

  onModuleDestroy(): void {
    this.stopped = true;
    this.reader?.close();
    this.events.ids = [];
    this.events.firewall = [];
  }
}
