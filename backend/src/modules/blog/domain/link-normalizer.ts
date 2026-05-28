export function normalizeBlogPostLink(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed;
  }

  url.hash = '';
  url.search = '';
  url.host = url.host.toLowerCase();
  url.protocol = url.protocol.toLowerCase();
  url.pathname = stripTrailingSlashes(url.pathname);

  return url.toString();
}

function stripTrailingSlashes(pathname: string): string {
  let result = pathname;
  while (result.length > 1 && result.endsWith('/')) {
    result = result.slice(0, -1);
  }
  return result.length === 0 ? '/' : result;
}
