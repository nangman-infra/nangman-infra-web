import { MemberProfile } from '../member-profile';

export const MEMBER_PORTFOLIO_RENDERER = Symbol('MEMBER_PORTFOLIO_RENDERER');

export interface MemberPortfolioRendererPort {
  render(member: MemberProfile): Promise<Buffer>;
}
