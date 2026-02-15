import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { ERROR_MESSAGES } from '../../../../common/constants/error-messages';
import { ContactMessage } from '../../domain/contact-message';
import { ContactNotificationError } from '../../domain/errors/contact-notification.error';
import { ContactNotifierPort } from '../../domain/ports/contact-notifier.port';

@Injectable()
export class MattermostWebhookNotifierAdapter implements ContactNotifierPort {
  private readonly logger = new Logger(MattermostWebhookNotifierAdapter.name);
  private readonly requestTimeoutMs = 5000;

  constructor(private readonly configService: ConfigService) {}

  async send(contactMessage: ContactMessage): Promise<void> {
    const webhookUrl =
      this.configService.get<string>('MATTERMOST_WEBHOOK_URL') ||
      process.env.MATTERMOST_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl.trim() === '') {
      this.logger.error('MATTERMOST_WEBHOOK_URL이 설정되지 않았습니다.', {
        service: MattermostWebhookNotifierAdapter.name,
        action: 'sendContactMessage',
      });
      throw new ContactNotificationError(
        ERROR_MESSAGES.MATTERMOST.WEBHOOK_URL_NOT_SET,
        500,
      );
    }

    try {
      await axios.post(
        webhookUrl.trim(),
        {
          text: this.formatMattermostMessage(contactMessage),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: this.requestTimeoutMs,
        },
      );

      this.logger.log('Mattermost 웹훅 메시지 전송 성공', {
        service: MattermostWebhookNotifierAdapter.name,
        action: 'sendContactMessage',
        name: contactMessage.name,
        email: contactMessage.email,
        subject: contactMessage.subject,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<unknown>;
        const errorMessage = this.getAxiosErrorMessage(axiosError);
        const statusCode = axiosError.response?.status ?? 502;

        this.logger.error('Mattermost 웹훅 메시지 전송 실패', {
          service: MattermostWebhookNotifierAdapter.name,
          action: 'sendContactMessage',
          error: errorMessage,
          status: statusCode,
          name: contactMessage.name,
          email: contactMessage.email,
          stack: axiosError.stack,
        });

        throw new ContactNotificationError(
          ERROR_MESSAGES.MATTERMOST.MESSAGE_SEND_FAILED(errorMessage),
          statusCode,
          errorMessage,
        );
      }

      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';

      this.logger.error('Mattermost 웹훅 메시지 전송 실패 (알 수 없는 에러)', {
        service: MattermostWebhookNotifierAdapter.name,
        action: 'sendContactMessage',
        error: errorMessage,
        name: contactMessage.name,
        email: contactMessage.email,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new ContactNotificationError(
        ERROR_MESSAGES.MATTERMOST.MESSAGE_SEND_FAILED(errorMessage),
        500,
        errorMessage,
      );
    }
  }

  private getAxiosErrorMessage(axiosError: AxiosError<unknown>): string {
    const responseData = axiosError.response?.data;

    if (typeof responseData === 'string' && responseData.trim().length > 0) {
      return responseData;
    }

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message;
    }

    return axiosError.message || ERROR_MESSAGES.MATTERMOST.WEBHOOK_CALL_FAILED;
  }

  private formatMattermostMessage(contactMessage: ContactMessage): string {
    return [
      '📧 새로운 문의',
      '',
      `- **이름:** ${contactMessage.name}`,
      `- **이메일:** ${contactMessage.email}`,
      `- **제목:** ${contactMessage.subject}`,
      '',
      '**메시지:**',
      contactMessage.message,
      '',
      `📅 ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
    ].join('\n');
  }
}
