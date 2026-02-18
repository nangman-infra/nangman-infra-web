import { Controller, Get } from '@nestjs/common';
import { MembersService } from './members.service';
import { MemberProfile } from './domain/member-profile';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async getAllMembers(): Promise<MemberProfile[]> {
    return this.membersService.getAll();
  }
}
