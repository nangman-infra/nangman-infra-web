import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

describe('ContactController', () => {
  const mockContactService = {
    sendContactMessage: jest.fn(),
  } as unknown as ContactService;

  const mockConfigService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  let controller: ContactController;

  beforeEach(() => {
    controller = new ContactController(mockContactService, mockConfigService);
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return config state in development mode', () => {
      (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'NODE_ENV') {
          return 'development';
        }
        if (key === 'MATTERMOST_WEBHOOK_URL') {
          return 'https://example.com/hook';
        }
        return undefined;
      });

      const result = controller.getConfig();

      expect(result).toEqual({
        hasBotToken: true,
        hasChannel: true,
        channelValue: 'mattermost-webhook',
        botTokenPrefix: 'configured',
      });
    });

    it('should throw NotFoundException outside development mode', () => {
      (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'NODE_ENV') {
          return 'production';
        }
        return undefined;
      });

      expect(() => controller.getConfig()).toThrow(NotFoundException);
    });
  });
});
