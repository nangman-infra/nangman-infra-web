import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MonitoringStatusResponse } from './monitoring.dto';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * 모니터링 상태 조회
   *
   * @returns {Promise<MonitoringStatusResponse>} 모니터링 상태 응답
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(): Promise<MonitoringStatusResponse> {
    return this.monitoringService.getMonitoringStatus();
  }
}
