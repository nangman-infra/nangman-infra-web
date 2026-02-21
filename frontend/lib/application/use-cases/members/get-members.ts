import type { Member } from '@/types/member';
import { fetchMembersApi } from '@/lib/infrastructure/http/members-api-client';

interface MembersProxyResponse {
  data?: unknown;
}

interface RawMember extends Omit<Member, 'category' | 'specialties' | 'achievements'> {
  category: Member['category'] | 'student';
  specialties?: unknown;
  achievements?: unknown;
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function isMember(value: unknown): value is RawMember {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (!isString(candidate.name) || !isString(candidate.role)) {
    return false;
  }

  if (candidate.slug !== undefined && !isString(candidate.slug)) {
    return false;
  }

  if (
    candidate.category !== 'senior' &&
    candidate.category !== 'mentee' &&
    candidate.category !== 'student'
  ) {
    return false;
  }

  if (candidate.specialties !== undefined && !isUnknownArray(candidate.specialties)) {
    return false;
  }

  if (candidate.achievements !== undefined && !isUnknownArray(candidate.achievements)) {
    return false;
  }

  return true;
}

function parseMembers(payload: unknown): Member[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const response = payload as MembersProxyResponse;
  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data
    .filter(isMember)
    .map((member): Member => {
      const { category, specialties, achievements, ...rest } = member;
      const normalizedSpecialties = normalizeStringArray(specialties);
      const normalizedAchievements = normalizeStringArray(achievements);

      return {
        ...rest,
        category: category === 'senior' ? 'senior' : 'mentee',
        ...(normalizedSpecialties !== undefined
          ? { specialties: normalizedSpecialties }
          : {}),
        ...(normalizedAchievements !== undefined
          ? { achievements: normalizedAchievements }
          : {}),
      };
    });
}

interface GetMembersUseCaseInput {
  fallback: Member[];
}

export async function getMembersUseCase(
  input: GetMembersUseCaseInput,
): Promise<Member[]> {
  const { fallback } = input;

  try {
    const payload = await fetchMembersApi();
    const members = parseMembers(payload);

    if (members.length === 0) {
      return fallback;
    }

    return members;
  } catch {
    return fallback;
  }
}
