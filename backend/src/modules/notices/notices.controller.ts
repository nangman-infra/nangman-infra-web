import { Controller, Get } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { Notice } from './domain/notice';

@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  async getAllNotices(): Promise<Notice[]> {
    return this.noticesService.getAll();
  }
}
