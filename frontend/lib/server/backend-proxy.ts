import { BACKEND_URL } from '@/lib/config';

const DEFAULT_BACKEND_TIMEOUT_MS = 8000;

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export function buildBackendUrl(path: string): string {
  return `${BACKEND_URL}${normalizePath(path)}`;
}

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_BACKEND_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(buildBackendUrl(path), {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function parseJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
