interface ErrorResponsePayload {
  message?: string;
}

const API_BASE_URL = '/api';

async function parseErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const payload = (await response.json().catch(() => null)) as
    | ErrorResponsePayload
    | null;

  return payload?.message || fallback;
}

export async function getApiJson<T>(
  path: string,
  fallbackErrorMessage: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, fallbackErrorMessage);
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function postApiJson<TResponse>(
  path: string,
  body: unknown,
  fallbackErrorMessage: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    body: JSON.stringify(body),
    ...init,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, fallbackErrorMessage);
    throw new Error(message);
  }

  return response.json() as Promise<TResponse>;
}
