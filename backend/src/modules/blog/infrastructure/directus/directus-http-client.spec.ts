import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { DirectusHttpClient } from './directus-http-client';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const configValues: Record<string, string> = {
  DIRECTUS_URL: 'http://directus.test',
  DIRECTUS_TOKEN: 'initial-token',
  DIRECTUS_EMAIL: 'admin@example.com',
  DIRECTUS_PASSWORD: 'pw',
};

const configService = {
  get: jest.fn((key: string) => configValues[key]),
} as unknown as ConfigService;

function makeAuthError(status: 401 | 403): AxiosError {
  const err = new AxiosError('auth');
  err.response = {
    status,
    statusText: 'auth',
    headers: {},
    config: {} as never,
    data: { errors: [{ message: 'forbidden' }] },
  };
  return err;
}

function makeHttpError(status: number, data: unknown): AxiosError {
  const err = new AxiosError(`status ${status}`);
  err.response = {
    status,
    statusText: 'err',
    headers: {},
    config: {} as never,
    data,
  };
  return err;
}

describe('DirectusHttpClient', () => {
  let client: DirectusHttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new DirectusHttpClient(configService);
  });

  it('sends GET with bearer token from configured token', async () => {
    mockedAxios.request.mockResolvedValue({ data: { hello: 'world' } });

    const result = await client.get<{ hello: string }>('/items/x', { a: 1 });

    expect(result).toEqual({ hello: 'world' });
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    const config = mockedAxios.request.mock.calls[0][0];
    expect(config.method).toBe('GET');
    expect(config.url).toBe('http://directus.test/items/x');
    expect(config.params).toEqual({ a: 1 });
    expect(config.headers).toMatchObject({
      Authorization: 'Bearer initial-token',
      Accept: 'application/json',
    });
    expect(config.headers).not.toHaveProperty('Content-Type');
  });

  it('sets Content-Type header on POST', async () => {
    mockedAxios.request.mockResolvedValue({ data: {} });

    await client.post('/items/x', { name: 'foo' });

    const config = mockedAxios.request.mock.calls[0][0];
    expect(config.method).toBe('POST');
    expect(config.headers).toMatchObject({
      'Content-Type': 'application/json',
    });
    expect(config.data).toEqual({ name: 'foo' });
  });

  it('refreshes token via login on 401 and retries the request once', async () => {
    mockedAxios.request
      .mockRejectedValueOnce(makeAuthError(401))
      .mockResolvedValueOnce({ data: { ok: true } });
    mockedAxios.post.mockResolvedValue({
      data: { data: { access_token: 'refreshed-token' } },
    });

    const result = await client.get('/items/x');

    expect(result).toEqual({ ok: true });
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.request).toHaveBeenCalledTimes(2);
    const retryConfig = mockedAxios.request.mock.calls[1][0];
    expect(retryConfig.headers).toMatchObject({
      Authorization: 'Bearer refreshed-token',
    });
  });

  it('caches the refreshed token for subsequent requests', async () => {
    mockedAxios.request
      .mockRejectedValueOnce(makeAuthError(403))
      .mockResolvedValueOnce({ data: 1 })
      .mockResolvedValueOnce({ data: 2 });
    mockedAxios.post.mockResolvedValue({
      data: { data: { access_token: 'refreshed-token' } },
    });

    await client.get('/items/x');
    await client.get('/items/y');

    const secondCallConfig = mockedAxios.request.mock.calls[2][0];
    expect(secondCallConfig.headers).toMatchObject({
      Authorization: 'Bearer refreshed-token',
    });
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('rethrows non-auth errors without retry', async () => {
    const error = makeHttpError(400, { errors: [{ message: 'bad' }] });
    mockedAxios.request.mockRejectedValue(error);

    await expect(client.patch('/items/x', {})).rejects.toBe(error);
    expect(mockedAxios.request).toHaveBeenCalledTimes(1);
  });

  it('throws clear error when DIRECTUS_URL is missing', async () => {
    configValues.DIRECTUS_URL = '';
    await expect(client.get('/x')).rejects.toThrow('Directus URL');
    configValues.DIRECTUS_URL = 'http://directus.test';
  });

  it('throws clear error when login credentials are missing after auth failure', async () => {
    mockedAxios.request.mockRejectedValueOnce(makeAuthError(401));
    configValues.DIRECTUS_EMAIL = '';
    await expect(client.get('/x')).rejects.toThrow('Directus Email');
    configValues.DIRECTUS_EMAIL = 'admin@example.com';
  });
});
