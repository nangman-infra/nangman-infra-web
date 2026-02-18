import { getApiJson } from '@/lib/infrastructure/http/json-api-client';

const MEMBERS_API_PATH = '/members';
const MEMBERS_ERROR_MESSAGE = '멤버 정보를 가져오는데 실패했습니다.';

export async function fetchMembersApi(): Promise<unknown> {
  return getApiJson<unknown>(MEMBERS_API_PATH, MEMBERS_ERROR_MESSAGE, {
    cache: 'no-store',
  });
}
