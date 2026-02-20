import { MemberProfile } from '../member-profile';
import { MemberPortfolioDocument } from '../models/member-portfolio-document.model';
import { MemberPortfolioJobSnapshot } from '../models/member-portfolio-job.model';

export const MEMBER_PORTFOLIO_JOB_MANAGER = 'MEMBER_PORTFOLIO_JOB_MANAGER';

export interface StartMemberPortfolioJobInput {
  jobKey: string;
  member: MemberProfile;
  fileName: string;
  contentType: string;
}

export interface MemberPortfolioJobManagerPort {
  start(
    input: StartMemberPortfolioJobInput,
  ): Promise<MemberPortfolioJobSnapshot>;
  get(jobId: string): Promise<MemberPortfolioJobSnapshot | null>;
  getDocument(jobId: string): Promise<MemberPortfolioDocument | null>;
}
