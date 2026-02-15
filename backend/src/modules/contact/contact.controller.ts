import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { ContactService } from './contact.service';
import { CreateContactDto } from './contact.dto';
import { EmailThrottlerGuard } from '../../common/guards/email-throttler.guard';
import {
  RATE_LIMIT_REQUESTS_PER_HOUR,
  RATE_LIMIT_TTL_MS,
} from '../../common/constants/rate-limiting';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Health check 엔드포인트
   *
   * @returns {object} 서비스 상태
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health(): { status: string; service: string } {
    return { status: 'ok', service: 'contact' };
  }

  /**
   * 환경 변수 확인 엔드포인트 (개발 환경용)
   *
   * @returns {object} 환경 변수 설정 상태
   */
  @Get('config')
  @HttpCode(HttpStatus.OK)
  getConfig(): {
    hasBotToken: boolean;
    hasChannel: boolean;
    channelValue: string | undefined;
    botTokenPrefix: string | null;
  } {
    const nodeEnv =
      this.configService.get<string>('NODE_ENV') || process.env.NODE_ENV;
    if (nodeEnv !== 'development') {
      throw new NotFoundException();
    }

    // 환경 변수 확인용 (개발 환경에서만 사용)
    const webhookUrl = this.configService.get<string>('MATTERMOST_WEBHOOK_URL');
    return {
      hasBotToken: !!webhookUrl,
      hasChannel: !!webhookUrl,
      channelValue: webhookUrl ? 'mattermost-webhook' : undefined,
      botTokenPrefix: webhookUrl ? 'configured' : null,
    };
  }

  /**
   * 문의 생성 및 Mattermost 전송
   * 이메일 기반 Rate Limiting 적용 (1시간에 5회 제한)
   *
   * @param {CreateContactDto} createContactDto - 문의 데이터
   * @returns {Promise<{success: boolean; message: string}>} 전송 결과
   */
  @Post()
  @UseGuards(EmailThrottlerGuard)
  @Throttle({
    default: {
      limit: RATE_LIMIT_REQUESTS_PER_HOUR,
      ttl: RATE_LIMIT_TTL_MS,
    },
  }) // 1시간에 5회 제한 (이메일 기반)
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createContactDto: CreateContactDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.contactService.sendContactMessage(createContactDto);
  }
}
