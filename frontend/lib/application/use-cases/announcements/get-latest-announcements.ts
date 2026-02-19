import type { Announcement, AnnouncementType } from '@/lib/domain/announcement';
import { fetchAnnouncementsApi } from '@/lib/infrastructure/http/announcements-api-client';

interface AnnouncementsProxyResponse {
  data?: unknown;
}

function isAnnouncementType(value: unknown): value is AnnouncementType {
  return value === 'notice' || value === 'update';
}

function isAnnouncement(value: unknown): value is Announcement {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.content === 'string' &&
    typeof candidate.date === 'string' &&
    isAnnouncementType(candidate.type) &&
    (candidate.publishedAt === undefined ||
      typeof candidate.publishedAt === 'string')
  );
}

function parseAnnouncements(payload: unknown): Announcement[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const response = payload as AnnouncementsProxyResponse;
  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data.filter(isAnnouncement);
}

interface GetLatestAnnouncementsUseCaseInput {
  count?: number;
}

export async function getLatestAnnouncementsUseCase(
  input: GetLatestAnnouncementsUseCaseInput,
): Promise<Announcement[]> {
  const { count } = input;

  try {
    const payload = await fetchAnnouncementsApi();
    const announcements = parseAnnouncements(payload);
    return typeof count === 'number' ? announcements.slice(0, count) : announcements;
  } catch {
    return [];
  }
}
