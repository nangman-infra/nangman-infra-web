import { Inject, Injectable } from '@nestjs/common';
import {
  CONTACT_NOTIFIER,
  ContactNotifierPort,
} from '../../domain/ports/contact-notifier.port';
import { ContactMessage } from '../../domain/contact-message';

export interface ContactSubmissionResult {
  success: boolean;
  message: string;
}

@Injectable()
export class SendContactMessageUseCase {
  constructor(
    @Inject(CONTACT_NOTIFIER)
    private readonly contactNotifier: ContactNotifierPort,
  ) {}

  async execute(
    contactMessage: ContactMessage,
  ): Promise<ContactSubmissionResult> {
    await this.contactNotifier.send(contactMessage);

    return {
      success: true,
      message: '문의가 성공적으로 전송되었습니다.',
    };
  }
}
