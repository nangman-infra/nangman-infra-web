import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { SendContactMessageUseCase } from './application/use-cases/send-contact-message.use-case';
import { CONTACT_NOTIFIER } from './domain/ports/contact-notifier.port';
import { MattermostWebhookNotifierAdapter } from './infrastructure/notifiers/mattermost-webhook-notifier.adapter';

@Module({
  controllers: [ContactController],
  providers: [
    ContactService,
    SendContactMessageUseCase,
    MattermostWebhookNotifierAdapter,
    {
      provide: CONTACT_NOTIFIER,
      useExisting: MattermostWebhookNotifierAdapter,
    },
  ],
})
export class ContactModule {}
