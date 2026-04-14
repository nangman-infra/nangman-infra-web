import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { chromium, type Browser } from 'playwright-core';
import { MemberProfile } from '../../domain/member-profile';
import { MemberPortfolioRendererPort } from '../../domain/ports/member-portfolio-renderer.port';
import { buildMemberPortfolioHtml } from './member-portfolio-html.template';

interface FontDataUrls {
  regularFontDataUrl?: string;
  boldFontDataUrl?: string;
}

const BROWSER_PATH_ENV = 'MEMBER_PDF_BROWSER_PATH';
const BROWSER_RUNTIME_DIR_ENV = 'MEMBER_PDF_BROWSER_RUNTIME_DIR';
const FRONTEND_URL_ENV = 'FRONTEND_URL';
const LOCAL_FRONTEND_URL = 'http://localhost:3002';
const DEFAULT_BROWSER_RUNTIME_DIR = join(
  tmpdir(),
  'nangman-member-pdf-browser',
);
const BROWSER_CACHE_DIR_NAME = 'cache';
const BROWSER_CONFIG_DIR_NAME = 'config';
const BROWSER_DATA_DIR_NAME = 'data';
const CHROMIUM_LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-features=Vulkan',
  '--disable-crash-reporter',
  '--disable-crashpad',
] as const;

function toStringEnvMap(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
}

export function getChromiumLaunchArgs(): string[] {
  return [...CHROMIUM_LAUNCH_ARGS];
}

export async function buildBrowserRuntimeEnv(
  env: NodeJS.ProcessEnv = process.env,
): Promise<Record<string, string>> {
  const runtimeDir =
    env[BROWSER_RUNTIME_DIR_ENV]?.trim() || DEFAULT_BROWSER_RUNTIME_DIR;
  const cacheDir = join(runtimeDir, BROWSER_CACHE_DIR_NAME);
  const configDir = join(runtimeDir, BROWSER_CONFIG_DIR_NAME);
  const dataDir = join(runtimeDir, BROWSER_DATA_DIR_NAME);

  await Promise.all([
    mkdir(runtimeDir, { recursive: true }),
    mkdir(cacheDir, { recursive: true }),
    mkdir(configDir, { recursive: true }),
    mkdir(dataDir, { recursive: true }),
  ]);

  return {
    ...toStringEnvMap(env),
    HOME: runtimeDir,
    XDG_CACHE_HOME: cacheDir,
    XDG_CONFIG_HOME: configDir,
    XDG_DATA_HOME: dataDir,
  };
}

export function summarizeBrowserLaunchErrorMessage(message: string): string {
  if (message.includes('chrome_crashpad_handler: --database is required')) {
    return 'Chromium 실행 환경 디렉터리를 초기화하지 못해 PDF 생성에 실패했습니다.';
  }

  if (message.includes('Target page, context or browser has been closed')) {
    return 'Chromium 브라우저 프로세스가 시작 직후 종료되어 PDF 생성에 실패했습니다.';
  }

  return message;
}

function buildBrowserLaunchLogDetail(message: string): string {
  const relevantLines = message
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        (line.includes('chrome_crashpad_handler') ||
          line.includes('Connection reset by peer') ||
          line.startsWith('browserType.launch:') ||
          line.startsWith('Call log:')),
    );

  return relevantLines.slice(0, 6).join(' | ');
}

@Injectable()
export class HtmlMemberPortfolioRendererAdapter
  implements MemberPortfolioRendererPort, OnModuleDestroy
{
  private readonly logger = new Logger(HtmlMemberPortfolioRendererAdapter.name);
  private readonly regularFontPath = join(
    process.cwd(),
    'node_modules',
    '@fontsource',
    'noto-sans-kr',
    'files',
    'noto-sans-kr-korean-400-normal.woff',
  );
  private readonly boldFontPath = join(
    process.cwd(),
    'node_modules',
    '@fontsource',
    'noto-sans-kr',
    'files',
    'noto-sans-kr-korean-700-normal.woff',
  );
  private fontDataUrlsPromise: Promise<FontDataUrls> | null = null;
  private browserPromise: Promise<Browser> | null = null;

  async render(member: MemberProfile): Promise<Buffer> {
    const executablePath = this.resolveBrowserExecutablePath();
    if (!executablePath) {
      throw new Error(
        'Chromium executable not found. Set MEMBER_PDF_BROWSER_PATH or install chromium in the runtime environment.',
      );
    }

    const [fontDataUrls, profileImageDataUrl] = await Promise.all([
      this.loadFontDataUrls(),
      this.resolveProfileImageDataUrl(member.profileImage),
    ]);

    const html = buildMemberPortfolioHtml({
      member,
      profileImageDataUrl: profileImageDataUrl ?? undefined,
      regularFontDataUrl: fontDataUrls.regularFontDataUrl,
      boldFontDataUrl: fontDataUrls.boldFontDataUrl,
    });

    const browser = await this.getBrowser(executablePath);
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'load' });
      await page.emulateMedia({ media: 'print' });
      await page.waitForLoadState('networkidle').catch(() => undefined);

      const content = await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
      });

      await page.close();
      return Buffer.from(content);
    } catch (error) {
      if (this.isBrowserDisconnectError(error)) {
        await this.dispose();
      }
      throw error;
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.dispose();
  }

  private resolveBrowserExecutablePath(): string | null {
    const configuredPath = process.env[BROWSER_PATH_ENV]?.trim();
    if (configuredPath && existsSync(configuredPath)) {
      return configuredPath;
    }

    const candidates = [
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];

    return candidates.find((path) => existsSync(path)) ?? null;
  }

  private async loadFontDataUrls(): Promise<FontDataUrls> {
    this.fontDataUrlsPromise ??= this.buildFontDataUrls();

    return this.fontDataUrlsPromise;
  }

  private async buildFontDataUrls(): Promise<FontDataUrls> {
    return {
      regularFontDataUrl: await this.readAssetAsDataUrl(
        this.regularFontPath,
        'font/woff',
      ),
      boldFontDataUrl: await this.readAssetAsDataUrl(
        this.boldFontPath,
        'font/woff',
      ),
    };
  }

  async dispose(): Promise<void> {
    const browserPromise = this.browserPromise;
    this.browserPromise = null;

    if (!browserPromise) {
      return;
    }

    const browser = await browserPromise.catch(() => null);
    if (!browser) {
      return;
    }

    await browser.close().catch(() => undefined);
  }

  private async getBrowser(executablePath: string): Promise<Browser> {
    this.browserPromise ??= buildBrowserRuntimeEnv()
      .then((launchEnv) =>
        chromium.launch({
          executablePath,
          headless: true,
          ignoreDefaultArgs: ['--enable-unsafe-swiftshader'],
          env: launchEnv,
          args: getChromiumLaunchArgs(),
        }),
      )
      .then((browser) => {
        browser.on('disconnected', () => {
          this.browserPromise = null;
        });
        return browser;
      })
      .catch((error) => {
        this.browserPromise = null;

        const rawMessage =
          error instanceof Error
            ? error.message
            : 'Chromium 브라우저 실행 중 알 수 없는 오류가 발생했습니다.';
        const summarizedMessage = summarizeBrowserLaunchErrorMessage(rawMessage);
        const detail = buildBrowserLaunchLogDetail(rawMessage);

        this.logger.error('Failed to launch Chromium for member portfolio PDF', {
          executablePath,
          error: summarizedMessage,
          detail,
        });

        throw new Error(summarizedMessage);
      });

    return this.browserPromise;
  }

  private async resolveProfileImageDataUrl(
    profileImage?: string,
  ): Promise<string | null> {
    if (!profileImage) {
      return null;
    }

    if (profileImage.startsWith('data:')) {
      return profileImage;
    }

    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
      return this.fetchAsDataUrl(profileImage);
    }

    const localFile = await this.resolveLocalPublicAssetPath(profileImage);
    if (localFile) {
      return (
        (await this.readAssetAsDataUrl(
          localFile,
          this.resolveMimeType(profileImage),
        )) ?? null
      );
    }

    const frontendUrl = this.resolveFrontendUrl();
    if (!frontendUrl) {
      return null;
    }

    try {
      const assetUrl = new URL(profileImage, frontendUrl).toString();
      return await this.fetchAsDataUrl(assetUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(
        `Failed to resolve remote profile image for PDF rendering: ${message}`,
      );
      return null;
    }
  }

  private resolveFrontendUrl(): string | null {
    const configured = process.env[FRONTEND_URL_ENV]?.trim();
    if (configured) {
      return configured;
    }

    return LOCAL_FRONTEND_URL;
  }

  private async resolveLocalPublicAssetPath(
    assetPath: string,
  ): Promise<string | null> {
    const normalizedPath = assetPath.replace(/^\/+/, '');
    const candidates = [
      join(process.cwd(), 'frontend', 'public', normalizedPath),
      join(process.cwd(), '..', 'frontend', 'public', normalizedPath),
      join(process.cwd(), 'public', normalizedPath),
    ];

    return candidates.find((path) => existsSync(path)) ?? null;
  }

  private async fetchAsDataUrl(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(
          `Failed to fetch asset for PDF rendering: ${url} (${response.status})`,
        );
        return null;
      }

      const contentType =
        response.headers.get('content-type') ?? this.resolveMimeType(url);
      const arrayBuffer = await response.arrayBuffer();
      return this.toDataUrl(Buffer.from(arrayBuffer), contentType);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`Failed to fetch asset for PDF rendering: ${message}`);
      return null;
    }
  }

  private async readAssetAsDataUrl(
    filePath: string,
    contentType: string,
  ): Promise<string | undefined> {
    if (!existsSync(filePath)) {
      return undefined;
    }

    const content = await readFile(filePath);
    return this.toDataUrl(content, contentType);
  }

  private toDataUrl(content: Buffer, contentType: string): string {
    return `data:${contentType};base64,${content.toString('base64')}`;
  }

  private isBrowserDisconnectError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return /Target page, context or browser has been closed|Browser has been closed|Connection closed/i.test(
      error.message,
    );
  }

  private resolveMimeType(path: string): string {
    const extension = extname(path).toLowerCase();

    switch (extension) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.webp':
        return 'image/webp';
      case '.svg':
        return 'image/svg+xml';
      case '.gif':
        return 'image/gif';
      default:
        return 'application/octet-stream';
    }
  }
}
