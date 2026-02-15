import { SendContactMessageUseCase } from './send-contact-message.use-case';
import { ContactNotifierPort } from '../../domain/ports/contact-notifier.port';

describe('SendContactMessageUseCase', () => {
  const mockNotifier: jest.Mocked<ContactNotifierPort> = {
    send: jest.fn(),
  };

  let useCase: SendContactMessageUseCase;

  beforeEach(() => {
    useCase = new SendContactMessageUseCase(mockNotifier);
    jest.clearAllMocks();
  });

  it('should send contact message via notifier and return success result', async () => {
    const contactMessage = {
      name: 'Tester',
      email: 'tester@example.com',
      subject: '문의 테스트',
      message: '테스트 메시지입니다.',
    };

    const result = await useCase.execute(contactMessage);

    expect(mockNotifier.send).toHaveBeenCalledTimes(1);
    expect(mockNotifier.send).toHaveBeenCalledWith(contactMessage);
    expect(result).toEqual({
      success: true,
      message: '문의가 성공적으로 전송되었습니다.',
    });
  });

  it('should propagate notifier errors', async () => {
    const contactMessage = {
      name: 'Tester',
      email: 'tester@example.com',
      subject: '문의 테스트',
      message: '테스트 메시지입니다.',
    };
    const expectedError = new Error('mattermost failed');
    mockNotifier.send.mockRejectedValue(expectedError);

    await expect(useCase.execute(contactMessage)).rejects.toThrow(
      expectedError,
    );
  });
});
