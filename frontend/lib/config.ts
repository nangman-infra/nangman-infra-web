function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export const BACKEND_URL = trimTrailingSlash(
  process.env.BACKEND_URL || 'http://localhost:3333',
);

export const INTERNAL_API_ORIGIN = trimTrailingSlash(
  process.env.INTERNAL_API_ORIGIN ||
    `http://localhost:${process.env.PORT || '3000'}`,
);
