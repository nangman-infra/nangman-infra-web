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
  let end = pathname.length;
  while (end > 1 && pathname.charCodeAt(end - 1) === 47 /* '/' */) {
    end--;
  }
  return end === 0 ? '/' : pathname.slice(0, end);
}
