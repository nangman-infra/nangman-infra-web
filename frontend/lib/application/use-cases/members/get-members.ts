import type { Member } from '@/types/member';
import { fetchMembersApi } from '@/lib/infrastructure/http/members-api-client';

interface MembersProxyResponse {
  data?: unknown;
}

interface RawMember extends Omit<Member, 'category'> {
  category: Member['category'] | 'student';
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isMember(value: unknown): value is RawMember {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (!isString(candidate.name) || !isString(candidate.role)) {
    return false;
  }

  if (
    candidate.category !== 'senior' &&
    candidate.category !== 'mentee' &&
    candidate.category !== 'student'
  ) {
    return false;
  }

  if (candidate.specialties !== undefined && !isStringArray(candidate.specialties)) {
    return false;
  }

  if (candidate.achievements !== undefined && !isStringArray(candidate.achievements)) {
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
    .map(
      (member): Member => ({
        ...member,
        category: member.category === 'senior' ? 'senior' : 'mentee',
      }),
    );
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
