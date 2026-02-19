import axios from 'axios';
import * as dotenv from 'dotenv';
import { noticeSeeds, NoticeSeedType } from './seeds/notices.seed';

interface DirectusResponse<T> {
  data: T;
}

interface DirectusItemId {
  id: number | string;
}

interface DirectusField {
  field: string;
}

interface DirectusCollection {
  collection: string;
}

interface DirectusAuthLoginResponse {
  data?: {
    access_token?: string;
  };
}

const NOTICES_COLLECTION = 'notices';

function resolveEnvFilePath(): string {
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'production') {
    return '.env.production';
  }

  return '.env.development';
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

function toNoticeType(value: string): NoticeSeedType {
  if (value === 'update' || value === 'notice') {
    return value;
  }

  return 'notice';
}

function toIsoDateFromLegacyLabel(label: string): string | null {
  const trimmed = label.trim();
  if (!trimmed) {
    return null;
  }

  const directParse = Date.parse(trimmed);
  if (!Number.isNaN(directParse)) {
    return new Date(directParse).toISOString();
  }

  const match = trimmed.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})$/);
  if (!match) {
    return null;
  }

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  return date.toISOString();
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

async function loginAndGetToken(baseUrl: string): Promise<string> {
  const email = requiredEnv('DIRECTUS_EMAIL');
  const password = requiredEnv('DIRECTUS_PASSWORD');

  const response = await axios.post<DirectusAuthLoginResponse>(
    `${baseUrl}/auth/login`,
    {
      email,
      password,
    },
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

async function ensureCollection(baseUrl: string, token: string): Promise<void> {
  const response = await axios.get<DirectusResponse<DirectusCollection[]>>(
    `${baseUrl}/collections`,
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    },
  );

  const exists = response.data.data.some(
    (collection) => collection.collection === NOTICES_COLLECTION,
  );

  if (exists) {
    return;
  }

  await axios.post(
    `${baseUrl}/collections`,
    {
      collection: NOTICES_COLLECTION,
      meta: {
        icon: 'campaign',
        note: 'Nangman Infra notices',
      },
      schema: {
        name: NOTICES_COLLECTION,
      },
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    },
  );
}

async function ensureFields(baseUrl: string, token: string): Promise<void> {
  const response = await axios.get<DirectusResponse<DirectusField[]>>(
    `${baseUrl}/fields/${NOTICES_COLLECTION}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    },
  );

  const existing = new Set(response.data.data.map((field) => field.field));

  const fields: Array<{ field: string; type: string; required?: boolean }> = [
    { field: 'slug', type: 'string', required: true },
    { field: 'title', type: 'string', required: true },
    { field: 'content', type: 'text', required: true },
    { field: 'type', type: 'string', required: true },
    { field: 'dateLabel', type: 'string' },
    { field: 'publishedAt', type: 'timestamp' },
    { field: 'sort', type: 'integer' },
  ];

  for (const field of fields) {
    if (existing.has(field.field)) {
      continue;
    }

    await axios.post(
      `${baseUrl}/fields/${NOTICES_COLLECTION}`,
      {
        field: field.field,
        type: field.type,
        meta: {
          interface:
            field.type === 'text'
              ? 'input-multiline'
              : field.type === 'timestamp'
                ? 'datetime'
                : 'input',
          ...(field.required ? { required: true } : {}),
        },
        schema: {
          ...(field.required ? { is_nullable: false } : {}),
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      },
    );
  }
}

async function getExistingId(
  baseUrl: string,
  token: string,
  slug: string,
): Promise<number | string | null> {
  const response = await axios.get<DirectusResponse<DirectusItemId[]>>(
    `${baseUrl}/items/${NOTICES_COLLECTION}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        limit: 1,
        fields: 'id',
        'filter[slug][_eq]': slug,
      },
      timeout: 8000,
    },
  );

  const found = response.data.data[0];
  return found?.id ?? null;
}

async function upsertNotices(baseUrl: string, token: string): Promise<void> {
  let created = 0;
  let updated = 0;

  for (const [index, notice] of noticeSeeds.entries()) {
    const slug = slugify(`${notice.id}-${notice.title}`);
    const payload = {
      slug,
      title: notice.title,
      content: notice.content,
      type: toNoticeType(notice.type),
      dateLabel: notice.date,
      publishedAt: toIsoDateFromLegacyLabel(notice.date),
      sort: index + 1,
    };

    const existingId = await getExistingId(baseUrl, token, slug);

    if (existingId) {
      await axios.patch(
        `${baseUrl}/items/${NOTICES_COLLECTION}/${existingId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000,
        },
      );
      updated += 1;
      continue;
    }

    await axios.post(`${baseUrl}/items/${NOTICES_COLLECTION}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });
    created += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Notices migration complete. created=${created}, updated=${updated}`);
}

async function main() {
  dotenv.config({ path: resolveEnvFilePath() });

  const baseUrl = requiredEnv('DIRECTUS_URL').replace(/\/$/, '');
  const token = await resolveAccessToken(baseUrl);

  await ensureCollection(baseUrl, token);
  await ensureFields(baseUrl, token);
  await upsertNotices(baseUrl, token);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Notices migration failed:', error);
  process.exit(1);
});
