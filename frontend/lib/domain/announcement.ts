export type AnnouncementType = 'notice' | 'update';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: AnnouncementType;
  publishedAt?: string;
}
