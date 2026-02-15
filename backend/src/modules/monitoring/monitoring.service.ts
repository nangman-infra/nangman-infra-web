import { Injectable } from '@nestjs/common';
import { GetMonitoringStatusUseCase } from './application/use-cases/get-monitoring-status.use-case';
import { MonitoringStatusResponse } from './monitoring.dto';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly getMonitoringStatusUseCase: GetMonitoringStatusUseCase,
  ) {}

  async getMonitoringStatus(): Promise<MonitoringStatusResponse> {
    const snapshot = await this.getMonitoringStatusUseCase.execute();

    return {
      success: true,
      data: snapshot,
    };
  }
}
