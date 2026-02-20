import { MemberProfile } from '../member-profile';

export interface MemberPortfolioTarget {
  member: MemberProfile;
  fileName: string;
  cacheKey: string;
}
