export type MemberPortfolioJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed';

export interface MemberPortfolioJobSnapshot {
  jobId: string;
  status: MemberPortfolioJobStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
  fileName?: string;
  contentType?: string;
  errorMessage?: string;
}
