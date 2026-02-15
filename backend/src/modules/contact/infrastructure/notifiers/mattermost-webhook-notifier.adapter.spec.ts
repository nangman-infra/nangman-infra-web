import { ConfigService } from '@nestjs/config';
import { ERROR_MESSAGES } from '../../../../common/constants/error-messages';
import { ContactNotificationError } from '../../domain/errors/contact-notification.error';
import { MattermostWebhookNotifierAdapter } from './mattermost-webhook-notifier.adapter';

describe('MattermostWebhookNotifierAdapter', () => {
  const mockConfigService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  let adapter: MattermostWebhookNotifierAdapter;
  const originalWebhookEnv = process.env.MATTERMOST_WEBHOOK_URL;

  beforeEach(() => {
    delete process.env.MATTERMOST_WEBHOOK_URL;
    adapter = new MattermostWebhookNotifierAdapter(mockConfigService);
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalWebhookEnv) {
      process.env.MATTERMOST_WEBHOOK_URL = originalWebhookEnv;
      return;
    }
    delete process.env.MATTERMOST_WEBHOOK_URL;
  });

  it('should throw ContactNotificationError when webhook url is missing', async () => {
    (mockConfigService.get as jest.Mock).mockReturnValue(undefined);

    await expect(
      adapter.send({
        name: 'Tester',
        email: 'tester@example.com',
        subject: '문의',
        message: '메시지',
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        name: ContactNotificationError.name,
        statusCode: 500,
        message: ERROR_MESSAGES.MATTERMOST.WEBHOOK_URL_NOT_SET,
      }),
    );
  });
});
