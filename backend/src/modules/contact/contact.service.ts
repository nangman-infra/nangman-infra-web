import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './contact.dto';
import { SendContactMessageUseCase } from './application/use-cases/send-contact-message.use-case';

@Injectable()
export class ContactService {
  constructor(
    private readonly sendContactMessageUseCase: SendContactMessageUseCase,
  ) {}

  /**
   * 문의 메시지 전송
   * 알림 어댑터를 통해 외부 메시징 시스템으로 문의를 전달
   *
   * @param {CreateContactDto} dto - 문의 데이터
   * @returns {Promise<{success: boolean; message: string}>} 전송 결과
   * @throws {HttpException} 알림 전송 실패 시
   */
  async sendToSlack(
    dto: CreateContactDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.sendContactMessageUseCase.execute({
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
    });
  }
}
