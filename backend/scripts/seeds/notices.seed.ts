export type NoticeSeedType = 'notice' | 'update';

export interface NoticeSeed {
  id: string;
  title: string;
  content: string;
  date: string;
  type: NoticeSeedType;
}

export const noticeSeeds: NoticeSeed[] = [
  {
    id: 'ops-20260301-goal',
    title: '2026 상반기 운영 목표',
    content:
      '모니터링 고도화, 콘텐츠 정비, 협업 프로세스 개선을 중심으로 운영 품질을 높여가고 있습니다.',
    date: '2026. 2. 19',
    type: 'update',
  },
  {
    id: 'ops-20260220-new-member',
    title: '신규 멤버 합류',
    content:
      '새로운 커뮤니티 멤버가 합류하여 멤버 소개가 업데이트되었습니다. 앞으로의 활동도 함께 지켜봐 주세요.',
    date: '2026. 2. 18',
    type: 'update',
  },
  {
    id: 'ops-20260220-team-ops',
    title: '커뮤니티 운영 안내',
    content:
      '프로필 및 활동 정보는 정기 점검 후 순차 반영됩니다. 문의 사항은 Contact 페이지로 접수해 주세요.',
    date: '2026. 2. 12',
    type: 'notice',
  },
  {
    id: 'ops-20260220-update-cycle',
    title: '공지/업데이트 반영 주기 안내',
    content:
      '홈페이지 공지사항과 멤버 정보는 내부 검토 후 반영되며, 긴급 공지는 우선 적용됩니다.',
    date: '2026. 2. 15',
    type: 'notice',
  },
  {
    id: 'ops-20260220-collaboration',
    title: '외부 협업 및 교류 상시 모집',
    content:
      '프로젝트 협업, 기술 교류, 세미나 제안은 언제든 환영합니다. Contact를 통해 제안해 주세요.',
    date: '2026. 2. 21',
    type: 'notice',
  },
];
