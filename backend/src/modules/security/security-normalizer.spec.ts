import {
  isPublicAddress,
  normalizeEvent,
  parseEventTime,
  publicSignature,
} from './security-normalizer';

const options = {
  wanInterfaces: new Set(['ix1']),
  protectedAddresses: new Set<string>(),
  offset: '+09:00',
};
const ids = {
  src_ip: '8.8.8.8',
  dest_ip: '192.168.10.20',
  dest_port: 443,
  proto: 'TCP',
  timestamp: '2026-10-17T10:00:00+09:00',
  alert: 'ET SCAN Service scan',
  alert_action: 'blocked',
  alert_sid: 1234,
  flow_id: 'flow-a',
};

describe('security event normalization', () => {
  it.each([
    '10.0.0.1',
    '172.16.0.1',
    '192.168.10.1',
    '100.64.0.1',
    '198.18.0.1',
    '198.19.255.254',
    '127.0.0.1',
    '169.254.1.2',
    '192.0.2.1',
    '203.0.113.1',
    '224.0.0.1',
    '::1',
    'fc00::1',
    '::ffff:192.168.1.1',
    '2001:db8::1',
    'invalid',
  ])('excludes non-public origin %s', (ip) => {
    expect(isPublicAddress(ip)).toBe(false);
  });

  it.each([
    '8.8.8.8',
    '172.32.0.1',
    '198.20.0.1',
    '2606:4700:4700::1111',
    '::ffff:8.8.8.8',
  ])('accepts global origin %s', (ip) =>
    expect(isPublicAddress(ip)).toBe(true),
  );

  it('publishes a sanitized incoming IDS event, not raw addresses or payload', () => {
    const event = normalizeEvent(
      'ids',
      { ...ids, payload: 'secret-content' },
      () => 'US',
      options,
    );
    expect(event).toMatchObject({
      action: 'blocked',
      category: 'Scanning',
      country: 'US',
      port: 443,
    });
    expect(JSON.stringify(event)).not.toMatch(
      /8\.8\.8\.8|192\.168\.10\.20|secret-content/,
    );
    expect(
      normalizeEvent(
        'ids',
        { ...ids, src_ip: ids.dest_ip, dest_ip: ids.src_ip },
        () => 'US',
        options,
      ),
    ).toBeNull();
  });

  it('only includes inbound blocks on the designated WAN interface', () => {
    const raw = {
      src: '8.8.4.4',
      dst: '192.168.10.1',
      interface: 'ix1',
      dir: 'in',
      action: 'block',
      __timestamp__: '2026-10-17 10:00:00',
      __digest__: 'record-a',
      protoname: 'tcp',
      dstport: '22',
    };
    expect(normalizeEvent('firewall', raw, () => 'US', options)?.port).toBe(22);
    for (const change of [
      { dir: 'out' },
      { action: 'pass' },
      { interface: 'ix0' },
    ]) {
      expect(
        normalizeEvent('firewall', { ...raw, ...change }, () => 'US', options),
      ).toBeNull();
    }
  });

  it('removes duplicate observations without merging events at different times', () => {
    const first = normalizeEvent('ids', ids, () => 'US', options)!;
    expect(normalizeEvent('ids', { ...ids }, () => 'US', options)?.id).toBe(
      first.id,
    );
    expect(
      normalizeEvent(
        'ids',
        { ...ids, timestamp: '2026-10-17T10:00:01+09:00' },
        () => 'US',
        options,
      )?.id,
    ).not.toBe(first.id);
  });

  it('interprets the appliance local timestamp and strips sensitive signature fields', () => {
    expect(parseEventTime('2026-10-17 10:00:00')).toBe(
      Date.parse('2026-10-17T01:00:00Z'),
    );
    expect(parseEventTime('bad')).toBeNull();
    expect(
      publicSignature(
        'SCAN 192.168.1.2 2606:4700::1111 https://private.example/ admin@example.com',
      ),
    ).toBe('SCAN [ip] [ip] [url] [email]');
  });

  it('redacts long IPv6 and email candidates without ambiguous repetition', () => {
    const repeatedAddress = `${'abcd:'.repeat(20_000)}1`;
    const repeatedMailbox = `${'sender'.repeat(20_000)}@example.com`;
    expect(publicSignature(repeatedAddress)).toBe('[ip]');
    expect(publicSignature(repeatedMailbox)).toBe('[email]');
    expect(publicSignature(`${'name'.repeat(20_000)}@localhost`)).toHaveLength(
      180,
    );
    expect(publicSignature('service:443 admin@example.com. ::1')).toBe(
      'service:443 [email] [ip]',
    );
  });

  it.each([null, undefined, '', -1, 65536, 1.5, 'invalid'])(
    'does not expose an invalid destination port %s',
    (dest_port) => {
      expect(
        normalizeEvent('ids', { ...ids, dest_port }, () => 'US', options)?.port,
      ).toBeNull();
    },
  );

  it('includes configured public destinations and rejects unknown timestamps', () => {
    const publicTarget = { ...ids, dest_ip: '1.1.1.1' };
    expect(normalizeEvent('ids', publicTarget, () => '', options)).toBeNull();
    expect(
      normalizeEvent('ids', publicTarget, () => '', {
        ...options,
        protectedAddresses: new Set(['1.1.1.1']),
      }),
    ).toMatchObject({ country: 'ZZ', port: 443 });
    expect(
      normalizeEvent('ids', { ...ids, timestamp: null }, () => 'US', options),
    ).toBeNull();
  });
});
