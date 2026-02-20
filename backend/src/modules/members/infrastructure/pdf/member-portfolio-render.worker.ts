import { parentPort } from 'node:worker_threads';
import { MemberProfile } from '../../domain/member-profile';
import { PdfMemberPortfolioRendererAdapter } from './pdf-member-portfolio-renderer.adapter';

interface RenderPayload {
  member: MemberProfile;
}

interface RenderSuccessMessage {
  ok: true;
  content: Uint8Array;
}

interface RenderErrorMessage {
  ok: false;
  error: string;
}

type RenderMessage = RenderSuccessMessage | RenderErrorMessage;

if (!parentPort) {
  throw new Error('Worker parent port is not available.');
}

const port = parentPort;
const renderer = new PdfMemberPortfolioRendererAdapter();

port.on('message', async (payload: RenderPayload) => {
  const send = (message: RenderMessage): void => {
    if (message.ok) {
      port.postMessage(message, [message.content.buffer]);
      return;
    }
    port.postMessage(message);
  };

  try {
    const pdf = await renderer.render(payload.member);
    const bytes = new Uint8Array(pdf);
    send({
      ok: true,
      content: bytes,
    });
  } catch (error) {
    send({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : '포트폴리오 PDF 생성 중 오류가 발생했습니다.',
    });
  }
});
