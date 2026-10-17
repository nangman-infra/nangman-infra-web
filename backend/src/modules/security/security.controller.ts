import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Query,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import type { SecurityFilter } from './security.types';

@Controller('security')
export class SecurityController {
  constructor(private readonly security: SecurityService) {}

  @Get('overview')
  @Header('Cache-Control', 'no-store')
  getOverview(@Query('source') source = 'all') {
    if (!['all', 'ids', 'firewall'].includes(source)) {
      throw new BadRequestException('Invalid security source.');
    }
    return this.security.snapshot(source as SecurityFilter);
  }
}
