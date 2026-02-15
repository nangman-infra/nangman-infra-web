import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { UpsInsights } from '../../domain/models/monitoring.model';
import { UpsStatusReaderPort } from '../../domain/ports/ups-status-reader.port';
import {
  PERCENTAGE_MULTIPLIER,
  UPS_TIMEOUT_MS,
} from '../../../../common/constants/monitoring';

const execAsync = promisify(exec);

@Injectable()
export class UpsStatusReaderAdapter implements UpsStatusReaderPort {
  private readonly logger = new Logger(UpsStatusReaderAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async read(): Promise<UpsInsights | null> {
    const rawNutServerUrl =
      this.configService.get<string>('NUT_SERVER_URL') ||
      process.env.NUT_SERVER_URL;
    const rawUpsName =
      this.configService.get<string>('NUT_UPS_NAME') ||
      process.env.NUT_UPS_NAME;

    if (!rawNutServerUrl?.trim() || !rawUpsName?.trim()) {
      this.logger.debug('NUT 환경 변수가 없어 UPS 수집을 생략합니다', {
        service: UpsStatusReaderAdapter.name,
        action: 'read',
        hasNutServerUrl: !!rawNutServerUrl,
        hasNutUpsName: !!rawUpsName,
      });
      return null;
    }

    // 입력 값 검증 및 sanitization
    const nutServerUrl = this.validateUPSInput(rawNutServerUrl);
    const upsName = this.validateUPSInput(rawUpsName);
    if (!nutServerUrl || !upsName) {
      this.logger.warn(
        'NUT 환경 변수 값이 유효하지 않아 UPS 수집을 생략합니다',
        {
          service: UpsStatusReaderAdapter.name,
          action: 'read',
        },
      );
      return null;
    }

    try {
      const command = `upsc ${upsName}@${nutServerUrl}`;
      const { stdout } = await execAsync(command, {
        timeout: UPS_TIMEOUT_MS,
      });

      const upsData: Record<string, string> = {};
      stdout.split('\n').forEach((line) => {
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          upsData[key.trim()] = value.trim();
        }
      });

      const status = this.parseUPSStatus(upsData['ups.status'] || 'UNKNOWN');
      const batteryCharge = this.parseNumber(upsData['battery.charge']);
      const batteryVoltage = this.parseNumber(upsData['battery.voltage']);
      const batteryVoltageNominal = this.parseNumber(
        upsData['battery.voltage.nominal'],
      );
      const inputVoltage = this.parseNumber(upsData['input.voltage']);
      const inputVoltageNominal = this.parseNumber(
        upsData['input.voltage.nominal'],
      );
      const outputVoltage = this.parseNumber(upsData['output.voltage']);
      const load = this.parseNumber(upsData['ups.load']);
      const realpowerNominal = this.parseNumber(
        upsData['ups.realpower.nominal'],
      );
      const temperature = this.parseNumber(upsData['battery.temperature']);
      const runtimeRemaining = this.parseNumber(upsData['battery.runtime']);

      const currentPower =
        load !== null && realpowerNominal !== null
          ? Math.round((load / PERCENTAGE_MULTIPLIER) * realpowerNominal)
          : null;

      return {
        status,
        batteryCharge,
        batteryVoltage,
        batteryVoltageNominal,
        inputVoltage,
        inputVoltageNominal,
        outputVoltage,
        load,
        realpowerNominal,
        currentPower,
        temperature,
        runtimeRemaining,
        lastUpdate: new Date().toISOString(),
      };
    } catch (error: unknown) {
      this.logger.warn('UPS 정보를 가져오는데 실패했습니다', {
        service: UpsStatusReaderAdapter.name,
        action: 'read',
        error: error instanceof Error ? error.message : String(error),
        nutServerUrl,
        upsName,
      });
      return null;
    }
  }

  private validateUPSInput(value: string): string | null {
    const sanitized = value.replace(/[^a-zA-Z0-9.\-:_]/g, '');
    if (!sanitized || sanitized.length === 0) {
      return null;
    }
    if (sanitized.length > 255) {
      return null;
    }
    return sanitized;
  }

  private parseUPSStatus(status: string): UpsInsights['status'] {
    const statusUpper = status.toUpperCase();

    if (statusUpper.includes('OL') || statusUpper.includes('ONLINE')) {
      if (statusUpper.includes('CHRG') || statusUpper.includes('CHARGING')) {
        return 'CHARGING';
      }
      return 'ONLINE';
    }

    if (statusUpper.includes('OB') || statusUpper.includes('ONBATT')) {
      return 'ONBATT';
    }

    if (statusUpper.includes('LB') || statusUpper.includes('LOWBATT')) {
      return 'LOWBATT';
    }

    if (statusUpper.includes('CHRG') || statusUpper.includes('CHARGING')) {
      return 'CHARGING';
    }

    return 'UNKNOWN';
  }

  private parseNumber(value: string | undefined): number | null {
    if (!value) {
      return null;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
}
