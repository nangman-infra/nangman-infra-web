import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { GetAllMembersUseCase } from './application/use-cases/get-all-members.use-case';
import { MEMBER_READER } from './domain/ports/member-reader.port';
import { DirectusMembersReaderAdapter } from './infrastructure/directus/directus-members-reader.adapter';

@Module({
  controllers: [MembersController],
  providers: [
    MembersService,
    GetAllMembersUseCase,
    DirectusMembersReaderAdapter,
    {
      provide: MEMBER_READER,
      useExisting: DirectusMembersReaderAdapter,
    },
  ],
})
export class MembersModule {}
