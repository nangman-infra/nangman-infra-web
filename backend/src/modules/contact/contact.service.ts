import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { CreateContactDto } from './contact.dto';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly slackApiUrl = 'https://slack.com/api/chat.postMessage';

  constructor(private readonly configService: ConfigService) {}

  /**
   * Slack으로 문의 메시지 전송
   * 환경 변수에서 Slack Bot Token과 Channel을 가져와 메시지 전송
   *
   * @param {CreateContactDto} dto - 문의 데이터
   * @returns {Promise<{success: boolean; message: string}>} 전송 결과
   * @throws {HttpException} 환경 변수 미설정 또는 Slack API 호출 실패 시
   */
  async sendToSlack(
    dto: CreateContactDto,
  ): Promise<{ success: boolean; message: string }> {
    // ConfigService에서 읽기 시도, 없으면 process.env에서 직접 읽기
    const botToken =
      this.configService.get<string>('SLACK_BOT_TOKEN') ||
      process.env.SLACK_BOT_TOKEN;
    let channel =
      this.configService.get<string>('SLACK_CHANNEL') ||
      process.env.SLACK_CHANNEL;

    // 따옴표 제거 (dotenv가 따옴표를 포함해서 로드할 수 있음)
    if (channel) {
      channel = channel.replace(/^["']|["']$/g, '').trim();
    }

    this.logger.debug('환경 변수 확인', {
      hasBotToken: !!botToken,
      hasChannel: !!channel,
      channelValue: channel,
    });

    if (!botToken || botToken.trim() === '') {
      this.logger.error('SLACK_BOT_TOKEN이 설정되지 않았습니다.', {
        service: 'ContactService',
        action: 'sendToSlack',
      });
      throw new HttpException(
        ERROR_MESSAGES.SLACK.BOT_TOKEN_NOT_SET,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!channel || channel.trim() === '') {
      this.logger.error('SLACK_CHANNEL이 설정되지 않았습니다.', {
        service: 'ContactService',
        action: 'sendToSlack',
        channelValue: channel,
      });
      throw new HttpException(
        ERROR_MESSAGES.SLACK.CHANNEL_NOT_SET,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const message = this.formatSlackMessage(dto);

      const response = await axios.post(
        this.slackApiUrl,
        {
          channel: channel,
          ...message,
        },
        {
          headers: {
            Authorization: `Bearer ${botToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data.ok) {
        const slackError = response.data.error;
        // not_in_channel 에러는 Bot이 채널에 초대되지 않았을 때 발생
        if (slackError === 'not_in_channel') {
          throw new HttpException(
            ERROR_MESSAGES.SLACK.BOT_NOT_IN_CHANNEL(channel),
            HttpStatus.BAD_REQUEST,
          );
        }
        throw new HttpException(
          slackError || ERROR_MESSAGES.SLACK.API_CALL_FAILED,
          HttpStatus.BAD_GATEWAY,
        );
      }

      this.logger.log('Slack 메시지 전송 성공', {
        service: 'ContactService',
        action: 'sendToSlack',
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        channel: channel,
      });

      return {
        success: true,
        message: '문의가 성공적으로 전송되었습니다.',
      };
    } catch (error: unknown) {
      // HttpException은 그대로 재throw (이미 적절한 HTTP 상태 코드 포함)
      if (error instanceof HttpException) {
        throw error;
      }

      // Axios 에러 처리
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ ok: boolean; error?: string }>;
        const errorMessage =
          axiosError.response?.data?.error ||
          axiosError.message ||
          '알 수 없는 오류';

        this.logger.error('Slack 메시지 전송 실패', {
          service: 'ContactService',
          action: 'sendToSlack',
          error: errorMessage,
          status: axiosError.response?.status,
          slackError: axiosError.response?.data?.error,
          channel: channel,
          name: dto.name,
          email: dto.email,
          stack: axiosError.stack,
        });

        // 사용자 친화적인 에러 메시지
        let userFriendlyMessage =
          ERROR_MESSAGES.SLACK.MESSAGE_SEND_FAILED(errorMessage);
        if (errorMessage.includes('not_in_channel')) {
          userFriendlyMessage =
            ERROR_MESSAGES.SLACK.BOT_NOT_IN_CHANNEL(channel);
        }

        throw new HttpException(
          userFriendlyMessage,
          axiosError.response?.status || HttpStatus.BAD_GATEWAY,
        );
      }

      // 알 수 없는 에러
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      this.logger.error('Slack 메시지 전송 실패 (알 수 없는 에러)', {
        service: 'ContactService',
        action: 'sendToSlack',
        error: errorMessage,
        channel: channel,
        name: dto.name,
        email: dto.email,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new HttpException(
        ERROR_MESSAGES.SLACK.MESSAGE_SEND_FAILED(errorMessage),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Slack 메시지 포맷팅
   * CreateContactDto를 Slack Block Kit 형식으로 변환
   *
   * @param {CreateContactDto} dto - 문의 데이터
   * @returns {object} Slack Block Kit 메시지 객체
   */
  private formatSlackMessage(dto: CreateContactDto): {
    text: string;
    blocks: Array<Record<string, unknown>>;
  } {
    return {
      text: '새로운 문의가 도착했습니다',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📧 새로운 문의',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*이름:*\n${dto.name}`,
            },
            {
              type: 'mrkdwn',
              text: `*이메일:*\n${dto.email}`,
            },
            {
              type: 'mrkdwn',
              text: `*제목:*\n${dto.subject}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*메시지:*\n${dto.message}`,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `📅 ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
            },
          ],
        },
      ],
    };
  }
}
