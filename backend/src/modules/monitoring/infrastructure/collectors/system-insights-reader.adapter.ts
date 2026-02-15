import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import { SystemInsightsReaderPort } from '../../domain/ports/system-insights-reader.port';
import { SystemInsights } from '../../domain/models/monitoring.model';
import {
  DECIMAL_PRECISION_DIVISOR,
  DECIMAL_PRECISION_MULTIPLIER,
  DEFAULT_IOWAIT_VALUE,
  PERCENTAGE_MULTIPLIER,
} from '../../../../common/constants/monitoring';

@Injectable()
export class SystemInsightsReaderAdapter implements SystemInsightsReaderPort {
  private readonly logger = new Logger(SystemInsightsReaderAdapter.name);
  private prevCpuUsage = { idle: 0, total: 0 };

  async read(): Promise<SystemInsights> {
    const load = os.loadavg() as [number, number, number];
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = (usedMem / totalMem) * PERCENTAGE_MULTIPLIER;

    const cpuUsage = await this.calculateCpuUsage();

    let ioWait = DEFAULT_IOWAIT_VALUE;
    try {
      if (process.platform === 'linux') {
        const stats = fs.readFileSync('/proc/stat', 'utf8');
        const cpuLine = stats
          .split('\n')
          .find((line) => line.startsWith('cpu '));
        if (cpuLine) {
          const parts = cpuLine.split(/\s+/);
          // /proc/stat 형식: cpu user nice system idle iowait irq softirq
          // iowait는 parts[5]에 위치하며, 전체 CPU 시간 대비 비율로 계산해야 함
          if (parts.length >= 6) {
            const iowaitTime = parseInt(parts[5], 10);
            const totalCpuTime = parts
              .slice(1, 11)
              .reduce((sum, val) => sum + parseInt(val, 10), 0);
            if (totalCpuTime > 0) {
              ioWait =
                Math.round(
                  (iowaitTime / totalCpuTime) *
                    PERCENTAGE_MULTIPLIER *
                    DECIMAL_PRECISION_MULTIPLIER,
                ) / DECIMAL_PRECISION_DIVISOR;
            }
          }
        }
      }
    } catch (error: unknown) {
      // I/O Wait 계산 실패 시 기본값 사용
      this.logger.debug('I/O Wait 계산 실패 (기본값 사용)', {
        service: SystemInsightsReaderAdapter.name,
        action: 'read',
        error: error instanceof Error ? error.message : String(error),
      });
      ioWait = DEFAULT_IOWAIT_VALUE;
    }

    return {
      load: load.map(
        (v) => Math.round(v * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER,
      ) as [number, number, number],
      cpu: cpuUsage,
      memory: {
        used: usedMem,
        total: totalMem,
        percentage:
          Math.round(memPercentage * DECIMAL_PRECISION_MULTIPLIER) /
          DECIMAL_PRECISION_DIVISOR,
      },
      ioWait,
      stealTime: 0.0,
    };
  }

  private async calculateCpuUsage(): Promise<number> {
    const cpus = os.cpus();
    let user = 0,
      nice = 0,
      sys = 0,
      idle = 0,
      irq = 0;

    for (const cpu of cpus) {
      user += cpu.times.user;
      nice += cpu.times.nice;
      sys += cpu.times.sys;
      idle += cpu.times.idle;
      irq += cpu.times.irq;
    }

    const total = user + nice + sys + idle + irq;
    const diffIdle = idle - this.prevCpuUsage.idle;
    const diffTotal = total - this.prevCpuUsage.total;

    this.prevCpuUsage = { idle, total };

    if (diffTotal === 0) {
      return 0;
    }
    const usage = PERCENTAGE_MULTIPLIER * (1 - diffIdle / diffTotal);
    return (
      Math.round(usage * DECIMAL_PRECISION_MULTIPLIER) /
      DECIMAL_PRECISION_DIVISOR
    );
  }
}
