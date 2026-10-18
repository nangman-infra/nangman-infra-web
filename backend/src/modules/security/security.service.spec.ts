import { ConfigService } from '@nestjs/config';
import { OpnsenseReader, SecurityReadError } from './opnsense.reader';
import { SecurityService } from './security.service';

jest.mock('./geoip.lookup', () => ({
  GeoIpLookup: jest
    .fn()
    .mockImplementation(() => ({ available: true, lookup: () => 'US' })),
}));
jest.mock('./opnsense.reader', () => ({
  ...jest.requireActual<typeof import('./opnsense.reader')>(
    './opnsense.reader',
  ),
  OpnsenseReader: jest.fn(),
}));

describe('transient security overview', () => {
  let service: SecurityService;
  let read: jest.Mock;
  let rows: Record<string, unknown>[];
  let failIds = false;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-17T12:00:00Z') });
    failIds = false;
    rows = [
      {
        src_ip: '8.8.8.8',
        dest_ip: '192.168.10.20',
        dest_port: 443,
        proto: 'TCP',
        timestamp: '2026-10-17T11:59:00Z',
        alert: 'ET SCAN Service scan',
        alert_action: 'blocked',
      },
    ];
    read = jest.fn(async (path: string) => {
      if (path.endsWith('/query_alerts')) {
        if (failIds) throw new SecurityReadError('permission');
        return { rows };
      }
      if (path.endsWith('/log'))
        return [
          {
            src: '1.1.1.1',
            dst: '192.168.10.1',
            interface: 'ix1',
            dir: 'in',
            action: 'block',
            __timestamp__: '2026-10-17T11:59:59Z',
            __digest__: 'block-a',
            protoname: 'TCP',
            dstport: 22,
          },
        ];
      if (path.endsWith('/status')) return { status: 'running' };
      return { rows: [{ enabled: '1' }, { enabled: '0' }] };
    });
    jest
      .mocked(OpnsenseReader)
      .mockImplementation(
        () => ({ read, close: jest.fn() }) as unknown as OpnsenseReader,
      );
    service = new SecurityService(
      new ConfigService({
        SECURITY_OPNSENSE_URL: 'https://192.168.10.1',
        SECURITY_OPNSENSE_CREDENTIALS_FILE: '/tmp/security-test/key.txt',
        SECURITY_OPNSENSE_CA_FILE: '/tmp/security-test/ca.pem',
        SECURITY_OPNSENSE_CERT_SHA256: 'a'.repeat(64),
        SECURITY_WAN_INTERFACES: 'ix1',
      }),
    );
    service.onModuleInit();
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.useRealTimers();
  });

  it('coalesces visitors, keeps IPS a subset, and filters event exploration', async () => {
    const [all, firewall] = await Promise.all([
      service.snapshot('all'),
      service.snapshot('firewall'),
    ]);
    expect(
      read.mock.calls.filter(([path]) => path.endsWith('/query_alerts')),
    ).toHaveLength(1);
    expect(all.summary).toEqual({
      detections: 1,
      ipsBlocked: 1,
      firewallBlocked: 1,
      countries: 1,
    });
    expect(firewall.summary).toEqual(all.summary);
    expect(firewall.events).toHaveLength(1);
    expect(firewall.events[0].source).toBe('firewall');
    expect(all.engine).toEqual({ status: 'running', enabledRulesets: 1 });
    expect(JSON.stringify(all)).not.toMatch(/192\.168|8\.8\.8\.8|1\.1\.1\.1/);
  });

  it.each(['all', 'ids', 'firewall'] as const)(
    'only publishes broad categories for the %s filter, including stale responses',
    async (filter) => {
      rows = [
        ...rows,
        {
          ...rows[0],
          alert:
            'ET CINS Active Threat Intelligence Poor Reputation IP group 17',
          alert_sid: 1234,
        },
        {
          ...rows[0],
          alert: 'ET DROP Dshield Block Listed Source group 1',
          alert_sid: 5678,
        },
        {
          ...rows[0],
          alert: 'Unrecognized private rule secret-rule-marker',
          alert_sid: 9999,
          alert_action: 'allowed',
        },
      ];
      const initial = await service.snapshot(filter);
      if (filter !== 'firewall') {
        expect(initial.events).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              category: 'Scanning',
              signature: 'Scanning',
            }),
            expect.objectContaining({
              category: 'Reputation',
              signature: 'Reputation',
            }),
            expect.objectContaining({
              category: 'Other',
              signature: 'Other',
              action: 'detected',
            }),
          ]),
        );
      }
      failIds = true;
      jest.advanceTimersByTime(10_001);
      const stale = await service.snapshot(filter);
      for (const snapshot of [initial, stale]) {
        expect(JSON.stringify(snapshot)).not.toMatch(
          /ET SCAN|CINS|Dshield|group 17|group 1|secret-rule-marker/,
        );
        for (const event of snapshot.events) {
          expect(event.signature).toBe(event.category);
          expect(event).not.toHaveProperty('alert_sid');
        }
      }
      expect(stale.summary).toEqual(initial.summary);
      expect(stale.sources[0].stale).toBe(true);
    },
  );

  it('replaces a snapshot instead of accumulating or retaining disappeared events', async () => {
    await service.snapshot('all');
    rows = [];
    jest.advanceTimersByTime(10_001);
    const next = await service.snapshot('ids');
    expect(next.summary.detections).toBe(0);
    expect(next.events).toHaveLength(0);
    expect(next.sources.find((source) => source.source === 'ids')?.stale).toBe(
      false,
    );
  });

  it('retains the last successful response on failure and explicitly marks it stale', async () => {
    const original = await service.snapshot('all');
    failIds = true;
    jest.advanceTimersByTime(10_001);
    const failed = await service.snapshot('all');
    expect(failed.summary.detections).toBe(1);
    expect(failed.sources[0]).toMatchObject({
      stale: true,
      error: 'permission',
      lastSuccess: original.sources[0].lastSuccess,
    });
    expect(failed.sources[1].stale).toBe(false);
  });

  it('shows an unconfigured state without accessing OPNsense', async () => {
    const unavailable = new SecurityService(new ConfigService({}));
    unavailable.onModuleInit();
    expect((await unavailable.snapshot('all')).configured).toBe(false);
    expect(read).not.toHaveBeenCalled();
    unavailable.onModuleDestroy();
  });
});
