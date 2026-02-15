import { ContactFormData, ContactResponse } from '@/lib/domain/contact';
import { postApiJson } from '@/lib/infrastructure/http/json-api-client';

const CONTACT_API_PATH = '/contact';
const CONTACT_ERROR_MESSAGE = '메시지 전송에 실패했습니다.';

export async function sendContactMessageUseCase(
  data: ContactFormData,
): Promise<ContactResponse> {
  return postApiJson<ContactResponse>(
    CONTACT_API_PATH,
    data,
    CONTACT_ERROR_MESSAGE,
  );
}
