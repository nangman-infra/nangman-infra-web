import { Notice } from '../notice';

export const NOTICE_READER = 'NOTICE_READER';

export interface NoticeReaderPort {
  readAll(): Promise<Notice[]>;
}
