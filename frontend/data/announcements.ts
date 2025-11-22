// Announcements data structure
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "notice" | "event" | "update";
}

export const announcements: Announcement[] = [
  {
    id: "1",
    title: "홈페이지 v1.0 런칭",
    content: "낭만 인프라 공식 홈페이지가 오픈되었습니다. 앞으로 많은 관심 부탁드립니다.",
    date: "2025. 12. 10",
    type: "update",
  },
];

// Get latest announcements
export function getLatestAnnouncements(count: number = 3): Announcement[] {
  return announcements.slice(0, count);
}

