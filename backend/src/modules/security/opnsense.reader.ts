import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Agent, request, RequestOptions } from 'node:https';
import { checkServerIdentity } from 'node:tls';
import type { RawRecord } from './security-normalizer';

export class SecurityReadError extends Error {
  constructor(readonly kind: 'permission' | 'connection' | 'configuration') {
    super(`Security data source: ${kind}`);
  }
}

const READ_PATHS = new Set([
  '/api/ids/service/status',
  '/api/ids/service/query_alerts',
  '/api/ids/settings/list_rulesets',
  '/api/diagnostics/firewall/log',
  '/api/diagnostics/interface/get_interface_names',
]);

export class OpnsenseReader {
  private readonly origin: URL;
  private readonly agent: Agent;
  private readonly authorization: string;

  constructor(
    url: string,
    credentialFile: string,
    caFile: string,
    fingerprint: string,
  ) {
    this.origin = new URL(url);
    if (
      this.origin.protocol !== 'https:' ||
      this.origin.username ||
      this.origin.password
    ) {
      throw new SecurityReadError('configuration');
    }
    const pairs = new Map(
      readFileSync(credentialFile, 'utf8')
        .split(/\r?\n/)
        .map((line) => {
          const index = line.indexOf('=');
          return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
        }),
    );
    if (!pairs.get('key') || !pairs.get('secret'))
      throw new SecurityReadError('configuration');
    const expected = fingerprint.toLowerCase().replace(/:/g, '');
    if (!/^[a-f0-9]{64}$/.test(expected))
      throw new SecurityReadError('configuration');
    this.authorization = `Basic ${Buffer.from(`${pairs.get('key')}:${pairs.get('secret')}`).toString('base64')}`;
    this.agent = new Agent({
      keepAlive: true,
      maxSockets: 4,
      ca: readFileSync(caFile),
      rejectUnauthorized: true,
      checkServerIdentity: (hostname, certificate) => {
        const actual = createHash('sha256')
          .update(certificate.raw)
          .digest('hex');
        // The explicit certificate pin identifies this self-signed appliance,
        // whose management IP need not appear in its hostname SAN.
        if (actual === expected) return undefined;
        return (
          checkServerIdentity(hostname, certificate) ??
          new Error('Certificate pin mismatch')
        );
      },
    });
  }

  private options(path: string, method = 'GET'): RequestOptions {
    if (!READ_PATHS.has(path)) throw new SecurityReadError('permission');
    return {
      protocol: 'https:',
      hostname: this.origin.hostname,
      port: this.origin.port || 443,
      path,
      method,
      agent: this.agent,
      headers: {
        Authorization: this.authorization,
        Accept: 'application/json',
      },
    };
  }

  read<T>(path: string, payload?: RawRecord): Promise<T> {
    if (payload && path !== '/api/ids/service/query_alerts') {
      return Promise.reject(new SecurityReadError('permission'));
    }
    return new Promise((resolve, reject) => {
      const body = payload ? JSON.stringify(payload) : undefined;
      const options = this.options(path, payload ? 'POST' : 'GET');
      if (body)
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        };
      const req = request(options, (response) => {
        const status = response.statusCode ?? 0;
        if (status !== 200) {
          response.resume();
          reject(
            new SecurityReadError(
              status === 401 || status === 403 ? 'permission' : 'connection',
            ),
          );
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        response.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > 16_000_000)
            req.destroy(new SecurityReadError('connection'));
          else chunks.push(chunk);
        });
        response.on('error', () => reject(new SecurityReadError('connection')));
        response.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as T);
          } catch {
            reject(new SecurityReadError('connection'));
          }
        });
      });
      req.setTimeout(15_000, () =>
        req.destroy(new SecurityReadError('connection')),
      );
      req.on('error', () => reject(new SecurityReadError('connection')));
      req.end(body);
    });
  }

  close(): void {
    this.agent.destroy();
  }
}
