import { Inject, Injectable } from '@nestjs/common';
import { MemberProfile } from '../../domain/member-profile';
import {
  MEMBER_READER,
  MemberReaderPort,
} from '../../domain/ports/member-reader.port';

@Injectable()
export class GetAllMembersUseCase {
  constructor(
    @Inject(MEMBER_READER)
    private readonly memberReader: MemberReaderPort,
  ) {}

  async execute(): Promise<MemberProfile[]> {
    return this.memberReader.readAll();
  }
}
