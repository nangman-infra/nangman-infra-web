import { getApiJson } from '@/lib/infrastructure/http/json-api-client';

const ANNOUNCEMENTS_API_PATH = '/announcements';
const ANNOUNCEMENTS_ERROR_MESSAGE = '공지사항을 가져오는데 실패했습니다.';

export async function fetchAnnouncementsApi(): Promise<unknown> {
  return getApiJson<unknown>(ANNOUNCEMENTS_API_PATH, ANNOUNCEMENTS_ERROR_MESSAGE, {
    cache: 'no-store',
  });
}
