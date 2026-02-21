import axios from 'axios';
import * as dotenv from 'dotenv';

interface DirectusResponse<T> {
  data: T;
}

interface DirectusItem {
  id: number | string;
  slug?: string | null;
  name?: string | null;
}

interface DirectusItemsResponse {
  data?: DirectusItem[];
}

interface DirectusAuthLoginResponse {
  data?: {
    access_token?: string;
  };
}

const MEMBERS_COLLECTION = 'members';

function resolveEnvFilePath(): string {
  return process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`환경변수 ${name} 이(가) 필요합니다.`);
  }

  return value;
}

function optionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-가-힣]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeSlug(value: string): string {
  const normalized = slugify(value);
  return normalized.length > 0 ? normalized : 'member';
}

async function loginAndGetToken(baseUrl: string): Promise<string> {
  const email = requiredEnv('DIRECTUS_EMAIL');
  const password = requiredEnv('DIRECTUS_PASSWORD');

  const response = await axios.post<DirectusAuthLoginResponse>(
    `${baseUrl}/auth/login`,
    { email, password },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 8000,
    },
  );

  const token = response.data?.data?.access_token?.trim();
  if (!token) {
    throw new Error('Directus 로그인 토큰을 가져오지 못했습니다.');
  }

  return token;
}

async function resolveAccessToken(baseUrl: string): Promise<string> {
  const email = optionalEnv('DIRECTUS_EMAIL');
  const password = optionalEnv('DIRECTUS_PASSWORD');
  if (email && password) {
    return loginAndGetToken(baseUrl);
  }

  const configuredToken = optionalEnv('DIRECTUS_TOKEN');
  if (configuredToken) {
    return configuredToken;
  }

  throw new Error(
    'DIRECTUS_TOKEN 또는 DIRECTUS_EMAIL/DIRECTUS_PASSWORD 설정이 필요합니다.',
  );
}

async function readMembers(
  baseUrl: string,
  token: string,
): Promise<DirectusItem[]> {
  const response = await axios.get<DirectusItemsResponse>(
    `${baseUrl}/items/${MEMBERS_COLLECTION}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        limit: -1,
        fields: 'id,slug,name',
      },
      timeout: 8000,
    },
  );

  if (!Array.isArray(response.data?.data)) {
    return [];
  }

  return response.data.data;
}

function resolveUniqueSlugs(members: DirectusItem[]): Map<number | string, string> {
  const used = new Set<string>();
  const resolved = new Map<number | string, string>();

  for (const member of members) {
    const id = member.id;
    const fromSlug = member.slug?.trim();
    const fromName = member.name?.trim();
    const base = normalizeSlug(fromSlug && fromSlug.length > 0 ? fromSlug : fromName ?? String(id));

    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    used.add(candidate);
    resolved.set(id, candidate);
  }

  return resolved;
}

async function patchMemberSlug(
  baseUrl: string,
  token: string,
  id: number | string,
  slug: string,
): Promise<void> {
  await axios.patch(
    `${baseUrl}/items/${MEMBERS_COLLECTION}/${id}`,
    { slug },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    },
  );
}

async function updateChangedSlugs(
  baseUrl: string,
  token: string,
  members: DirectusItem[],
): Promise<number> {
  const desiredById = resolveUniqueSlugs(members);
  let changed = 0;

  for (const member of members) {
    const current = member.slug?.trim() ?? '';
    const desired = desiredById.get(member.id) ?? '';
    if (current === desired) {
      continue;
    }

    await patchMemberSlug(baseUrl, token, member.id, desired);
    changed += 1;
  }

  return changed;
}

async function enforceFieldConstraint(
  baseUrl: string,
  token: string,
): Promise<void> {
  await axios.patch(
    `${baseUrl}/fields/${MEMBERS_COLLECTION}/slug`,
    {
      meta: {
        required: true,
      },
      schema: {
        is_nullable: false,
        is_unique: true,
      },
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    },
  );
}

function summarizeSlugs(members: DirectusItem[]): {
  missing: number;
  duplicate: number;
} {
  const normalized = members.map((member) => (member.slug ?? '').trim().toLowerCase());
  const missing = normalized.filter((slug) => slug.length === 0).length;
  const counter = new Map<string, number>();

  for (const slug of normalized) {
    if (!slug) {
      continue;
    }

    counter.set(slug, (counter.get(slug) ?? 0) + 1);
  }

  const duplicate = [...counter.values()].filter((count) => count > 1).length;
  return { missing, duplicate };
}

async function main(): Promise<void> {
  dotenv.config({ path: resolveEnvFilePath() });

  const baseUrl = requiredEnv('DIRECTUS_URL').replace(/\/$/, '');
  const token = await resolveAccessToken(baseUrl);

  const before = await readMembers(baseUrl, token);
  const beforeSummary = summarizeSlugs(before);

  const changed = await updateChangedSlugs(baseUrl, token, before);
  await enforceFieldConstraint(baseUrl, token);

  const after = await readMembers(baseUrl, token);
  const afterSummary = summarizeSlugs(after);

  // eslint-disable-next-line no-console
  console.log(
    `Members slug constraint applied. changed=${changed} before(missing=${beforeSummary.missing}, duplicate=${beforeSummary.duplicate}) after(missing=${afterSummary.missing}, duplicate=${afterSummary.duplicate})`,
  );
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Members slug constraint enforcement failed:', error);
  process.exit(1);
});
