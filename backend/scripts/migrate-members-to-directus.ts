import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import { members } from '../../frontend/data/members';

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

const MEMBERS_COLLECTION = 'members';

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
    (collection) => collection.collection === MEMBERS_COLLECTION,
  );

  if (exists) {
    return;
  }

  await axios.post(
    `${baseUrl}/collections`,
    {
      collection: MEMBERS_COLLECTION,
      meta: {
        icon: 'groups',
        note: 'Nangman Infra members profiles',
      },
      schema: {
        name: MEMBERS_COLLECTION,
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
    `${baseUrl}/fields/${MEMBERS_COLLECTION}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    },
  );

  const existing = new Set(response.data.data.map((field) => field.field));

  const fields: Array<{ field: string; type: string; required?: boolean }> = [
    { field: 'slug', type: 'string', required: true },
    { field: 'name', type: 'string', required: true },
    { field: 'role', type: 'string', required: true },
    { field: 'affiliation', type: 'text' },
    { field: 'category', type: 'string', required: true },
    { field: 'experience', type: 'string' },
    { field: 'bio', type: 'text' },
    { field: 'specialties', type: 'json' },
    { field: 'achievements', type: 'json' },
    { field: 'profileImage', type: 'string' },
    { field: 'education', type: 'json' },
    { field: 'workExperience', type: 'json' },
    { field: 'certifications', type: 'json' },
    { field: 'projects', type: 'json' },
    { field: 'technicalSkills', type: 'json' },
    { field: 'mentoring', type: 'json' },
    { field: 'links', type: 'json' },
    { field: 'sort', type: 'integer' },
  ];

  for (const field of fields) {
    if (existing.has(field.field)) {
      continue;
    }

    await axios.post(
      `${baseUrl}/fields/${MEMBERS_COLLECTION}`,
      {
        field: field.field,
        type: field.type,
        meta: {
          interface:
            field.type === 'json'
              ? 'input-code'
              : field.type === 'text'
                ? 'input-multiline'
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
    `${baseUrl}/items/${MEMBERS_COLLECTION}`,
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

async function upsertMembers(baseUrl: string, token: string): Promise<void> {
  let created = 0;
  let updated = 0;

  for (const [index, member] of members.entries()) {
    const slug = slugify(member.name);
    const payload = {
      slug,
      name: member.name,
      role: member.role,
      affiliation: member.affiliation ?? null,
      category: member.category,
      experience: member.experience ?? null,
      bio: member.bio ?? null,
      specialties: member.specialties ?? [],
      achievements: member.achievements ?? [],
      profileImage: member.profileImage ?? null,
      education: member.education ?? [],
      workExperience: member.workExperience ?? [],
      certifications: member.certifications ?? [],
      projects: member.projects ?? [],
      technicalSkills: member.technicalSkills ?? [],
      mentoring: member.mentoring ?? null,
      links: member.links ?? null,
      sort: index + 1,
    };

    const existingId = await getExistingId(baseUrl, token, slug);

    if (existingId) {
      await axios.patch(
        `${baseUrl}/items/${MEMBERS_COLLECTION}/${existingId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000,
        },
      );
      updated += 1;
      continue;
    }

    await axios.post(`${baseUrl}/items/${MEMBERS_COLLECTION}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });
    created += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Members migration complete. created=${created}, updated=${updated}`);
}

async function main() {
  dotenv.config({ path: resolveEnvFilePath() });

  const baseUrl = requiredEnv('DIRECTUS_URL').replace(/\/$/, '');
  const token = await resolveAccessToken(baseUrl);

  await ensureCollection(baseUrl, token);
  await ensureFields(baseUrl, token);
  await upsertMembers(baseUrl, token);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Members migration failed:', error);
  process.exit(1);
});
