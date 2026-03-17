import { parentPort } from 'node:worker_threads';
import { MemberProfile } from '../../domain/member-profile';
import { HtmlMemberPortfolioRendererAdapter } from './html-member-portfolio-renderer.adapter';

interface RenderPayload {
  type: 'render';
  member: MemberProfile;
}

interface ShutdownPayload {
  type: 'shutdown';
}

type WorkerPayload = RenderPayload | ShutdownPayload;

interface RenderSuccessMessage {
  ok: true;
  content: Uint8Array;
}

interface ShutdownSuccessMessage {
  ok: true;
  type: 'shutdown';
}

interface RenderErrorMessage {
  ok: false;
  error: string;
}

type RenderMessage =
  | RenderSuccessMessage
  | ShutdownSuccessMessage
  | RenderErrorMessage;

if (!parentPort) {
  throw new Error('Worker parent port is not available.');
}

const port = parentPort;
const renderer = new HtmlMemberPortfolioRendererAdapter();

port.on('message', async (payload: WorkerPayload) => {
  const send = (message: RenderMessage): void => {
    if (message.ok) {
      if ('content' in message) {
        port.postMessage(message, [message.content.buffer]);
        return;
      }
      port.postMessage(message);
      return;
    }
    port.postMessage(message);
  };

  if (payload.type === 'shutdown') {
    await renderer.dispose();
    send({
      ok: true,
      type: 'shutdown',
    });
    port.close();
    return;
  }

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
