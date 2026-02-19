import { Inject, Injectable } from '@nestjs/common';
import { Notice } from '../../domain/notice';
import {
  NOTICE_READER,
  NoticeReaderPort,
} from '../../domain/ports/notice-reader.port';

@Injectable()
export class GetAllNoticesUseCase {
  constructor(
    @Inject(NOTICE_READER)
    private readonly noticeReader: NoticeReaderPort,
  ) {}

  async execute(): Promise<Notice[]> {
    return this.noticeReader.readAll();
  }
}
