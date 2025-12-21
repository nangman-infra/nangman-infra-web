const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export async function sendContactMessage(
  data: ContactFormData,
): Promise<ContactResponse> {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: '메시지 전송에 실패했습니다.',
    }));
    throw new Error(error.message || '메시지 전송에 실패했습니다.');
  }

  return response.json();
}

