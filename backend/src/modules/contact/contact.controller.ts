import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
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

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok', service: 'contact' };
  }

  @Get('config')
  @HttpCode(HttpStatus.OK)
  getConfig() {
    // 환경 변수 확인용 (개발 환경에서만 사용)
    const botToken = this.configService.get<string>('SLACK_BOT_TOKEN');
    const channel = this.configService.get<string>('SLACK_CHANNEL');
    return {
      hasBotToken: !!botToken,
      hasChannel: !!channel,
      channelValue: channel,
      botTokenPrefix: botToken ? botToken.substring(0, 10) + '...' : null,
    };
  }

  @Post()
  @UseGuards(EmailThrottlerGuard)
  @Throttle({
    default: {
      limit: RATE_LIMIT_REQUESTS_PER_HOUR,
      ttl: RATE_LIMIT_TTL_MS,
    },
  }) // 1시간에 5회 제한 (이메일 기반)
  @HttpCode(HttpStatus.OK)
  async create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.sendToSlack(createContactDto);
  }
}
