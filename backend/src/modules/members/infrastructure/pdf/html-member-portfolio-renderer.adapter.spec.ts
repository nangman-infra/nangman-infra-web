import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildBrowserRuntimeEnv,
  getChromiumLaunchArgs,
  summarizeBrowserLaunchErrorMessage,
} from './html-member-portfolio-renderer.adapter';

describe('HtmlMemberPortfolioRendererAdapter helpers', () => {
  it('should include crashpad-safe chromium launch args', () => {
    const args = getChromiumLaunchArgs();

    expect(args).toEqual(
      expect.arrayContaining(['--disable-crash-reporter', '--disable-crashpad']),
    );
  });

  it('should build writable browser runtime env under configured directory', async () => {
    const runtimeDir = await mkdtemp(
      join(tmpdir(), 'nangman-member-pdf-browser-test-'),
    );

    try {
      const env = await buildBrowserRuntimeEnv({
        MEMBER_PDF_BROWSER_RUNTIME_DIR: runtimeDir,
        PATH: process.env.PATH,
      });

      expect(env.HOME).toBe(runtimeDir);
      expect(env.XDG_CACHE_HOME).toBe(join(runtimeDir, 'cache'));
      expect(env.XDG_CONFIG_HOME).toBe(join(runtimeDir, 'config'));
      expect(env.XDG_DATA_HOME).toBe(join(runtimeDir, 'data'));
    } finally {
      await rm(runtimeDir, { recursive: true, force: true });
    }
  });

  it('should summarize crashpad launch errors for operator-friendly handling', () => {
    const summary = summarizeBrowserLaunchErrorMessage(`
      browserType.launch: Target page, context or browser has been closed
      [pid=44][err] chrome_crashpad_handler: --database is required
    `);

    expect(summary).toBe(
      'Chromium 실행 환경 디렉터리를 초기화하지 못해 PDF 생성에 실패했습니다.',
    );
  });
});
