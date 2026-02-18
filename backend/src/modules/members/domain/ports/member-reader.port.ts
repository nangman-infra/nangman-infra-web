import { MemberProfile } from '../member-profile';

export const MEMBER_READER = Symbol('MEMBER_READER');

export interface MemberReaderPort {
  readAll(): Promise<MemberProfile[]>;
}
