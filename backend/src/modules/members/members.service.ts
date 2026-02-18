import { Injectable } from '@nestjs/common';
import { GetAllMembersUseCase } from './application/use-cases/get-all-members.use-case';
import { MemberProfile } from './domain/member-profile';

@Injectable()
export class MembersService {
  constructor(private readonly getAllMembersUseCase: GetAllMembersUseCase) {}

  async getAll(): Promise<MemberProfile[]> {
    return this.getAllMembersUseCase.execute();
  }
}
