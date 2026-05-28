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
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';

  return url.toString();
}
