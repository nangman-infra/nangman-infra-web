import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus() {
    return this.monitoringService.getMonitoringStatus();
  }
}
