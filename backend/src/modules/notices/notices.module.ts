import { Module } from '@nestjs/common';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';
import { GetAllNoticesUseCase } from './application/use-cases/get-all-notices.use-case';
import { NOTICE_READER } from './domain/ports/notice-reader.port';
import { DirectusNoticesReaderAdapter } from './infrastructure/directus/directus-notices-reader.adapter';

@Module({
  controllers: [NoticesController],
  providers: [
    NoticesService,
    GetAllNoticesUseCase,
    DirectusNoticesReaderAdapter,
    {
      provide: NOTICE_READER,
      useExisting: DirectusNoticesReaderAdapter,
    },
  ],
})
export class NoticesModule {}
