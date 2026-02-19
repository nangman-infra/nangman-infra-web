export type NoticeType = 'notice' | 'update';

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: NoticeType;
  publishedAt?: string;
}
