import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import type { ClientRequest, IncomingMessage } from 'node:http';
import { Agent, request, RequestOptions } from 'node:https';
import type { PeerCertificate } from 'node:tls';
import { OpnsenseReader } from './opnsense.reader';

jest.mock('node:fs', () => ({ readFileSync: jest.fn() }));
jest.mock('node:https', () => ({
  Agent: jest.fn().mockImplementation(() => ({ destroy: jest.fn() })),
  request: jest.fn(),
}));

const certificate = Buffer.from('test appliance certificate');
const fingerprint = createHash('sha256').update(certificate).digest('hex');
const keyPath = '/tmp/nangman-reader-test/api-key.txt';
const caPath = '/tmp/nangman-reader-test/appliance.pem';

describe('read-only appliance transport', () => {
  let reader: OpnsenseReader;
  let receive: (response: IncomingMessage) => void;
  let outgoing: EventEmitter & {
    end: jest.Mock;
    destroy: jest.Mock;
    setTimeout: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(readFileSync)
      .mockImplementation((path) =>
        String(path) === keyPath
          ? 'key=test-key\nsecret=test-secret\n'
          : certificate,
      );
    outgoing = Object.assign(new EventEmitter(), {
      end: jest.fn(),
      setTimeout: jest.fn(),
      destroy: jest.fn((error: Error) => outgoing.emit('error', error)),
    });
    jest.mocked(request).mockImplementation((options, callback) => {
      receive = callback as (response: IncomingMessage) => void;
      return outgoing as unknown as ClientRequest;
    });
    reader = new OpnsenseReader(
      'https://192.168.10.1',
      keyPath,
      caPath,
      fingerprint,
    );
  });

  afterEach(() => reader.close());

  function respond(statusCode: number, body: string): void {
    const response = Object.assign(new EventEmitter(), {
      statusCode,
      resume: jest.fn(),
    });
    receive(response as unknown as IncomingMessage);
    response.emit('data', Buffer.from(body));
    response.emit('end');
  }

  it('requires trusted TLS and the independently verified certificate pin', () => {
    const options = jest.mocked(Agent).mock.calls[0][0]!;
    expect(options.rejectUnauthorized).toBe(true);
    expect(options.ca).toEqual(certificate);
    const verify = options.checkServerIdentity!;
    expect(
      verify('management', { raw: certificate } as PeerCertificate),
    ).toBeUndefined();
    const wrongCertificate = {
      raw: Buffer.from('different certificate'),
      subject: { CN: 'management' },
      subjectaltname: 'DNS:management',
    } as PeerCertificate;
    expect(verify('management', wrongCertificate)).toBeInstanceOf(Error);
  });

  it.each([
    ['http://192.168.10.1', fingerprint],
    ['https://user:password@192.168.10.1', fingerprint],
    ['https://192.168.10.1', 'invalid'],
  ])('rejects invalid origin or certificate configuration', (origin, pin) => {
    expect(() => new OpnsenseReader(origin, keyPath, caPath, pin)).toThrow();
  });

  it('rejects incomplete credentials before opening a connection', () => {
    jest.mocked(readFileSync).mockReturnValueOnce('key=only-a-key');
    expect(
      () =>
        new OpnsenseReader(
          'https://192.168.10.1',
          keyPath,
          caPath,
          fingerprint,
        ),
    ).toThrow();
    expect(request).not.toHaveBeenCalled();
  });

  it('only allows the defined read paths and the IDS query POST', async () => {
    await expect(
      reader.read('/api/core/firmware/status'),
    ).rejects.toMatchObject({ kind: 'permission' });
    await expect(
      reader.read('/api/ids/service/status', { enabled: true }),
    ).rejects.toMatchObject({ kind: 'permission' });
    expect(request).not.toHaveBeenCalled();
    const payload = { current: 1, rowCount: 5000, searchPhrase: '' };
    const result = reader.read('/api/ids/service/query_alerts', payload);
    const options = jest.mocked(request).mock.calls[0][0] as RequestOptions;
    expect(options.method).toBe('POST');
    expect(outgoing.end).toHaveBeenCalledWith(JSON.stringify(payload));
    respond(200, '{"rows":[]}');
    await expect(result).resolves.toEqual({ rows: [] });
  });

  it('reads status using GET without writing a request body', async () => {
    const result = reader.read('/api/ids/service/status');
    expect(jest.mocked(request).mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/api/ids/service/status',
    });
    expect(outgoing.end).toHaveBeenCalledWith(undefined);
    respond(200, '{"status":"running"}');
    await expect(result).resolves.toEqual({ status: 'running' });
  });

  it.each([
    [401, 'permission'],
    [403, 'permission'],
    [500, 'connection'],
  ])(
    'classifies HTTP %s without exposing the upstream response',
    async (status, kind) => {
      const result = reader.read('/api/ids/service/status');
      respond(Number(status), 'private upstream detail');
      await expect(result).rejects.toMatchObject({
        kind,
        message: `Security data source: ${kind}`,
      });
    },
  );

  it('rejects malformed JSON, transport failures and response timeouts', async () => {
    const invalid = reader.read('/api/ids/service/status');
    respond(200, '{invalid');
    await expect(invalid).rejects.toMatchObject({ kind: 'connection' });
    const interrupted = reader.read('/api/ids/service/status');
    outgoing.emit('error', new Error('private connection detail'));
    await expect(interrupted).rejects.toMatchObject({ kind: 'connection' });
    const timedOut = reader.read('/api/ids/service/status');
    outgoing.setTimeout.mock.calls.at(-1)![1]();
    await expect(timedOut).rejects.toMatchObject({ kind: 'connection' });
  });

  it('aborts an oversized response before parsing it', async () => {
    const result = reader.read('/api/ids/service/status');
    const response = Object.assign(new EventEmitter(), {
      statusCode: 200,
      resume: jest.fn(),
    });
    receive(response as unknown as IncomingMessage);
    response.emit('data', Buffer.alloc(16_000_001));
    await expect(result).rejects.toMatchObject({ kind: 'connection' });
    expect(outgoing.destroy).toHaveBeenCalled();
  });
});
