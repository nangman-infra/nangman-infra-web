import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
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
const FRONTEND_URL_ENV = 'FRONTEND_URL';
const LOCAL_FRONTEND_URL = 'http://localhost:3002';

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
    if (!this.fontDataUrlsPromise) {
      this.fontDataUrlsPromise = (async () => ({
        regularFontDataUrl: await this.readAssetAsDataUrl(
          this.regularFontPath,
          'font/woff',
        ),
        boldFontDataUrl: await this.readAssetAsDataUrl(
          this.boldFontPath,
          'font/woff',
        ),
      }))();
    }

    return this.fontDataUrlsPromise;
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
    if (!this.browserPromise) {
      this.browserPromise = chromium
        .launch({
          executablePath,
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ],
        })
        .then((browser) => {
          browser.on('disconnected', () => {
            this.browserPromise = null;
          });
          return browser;
        })
        .catch((error) => {
          this.browserPromise = null;
          throw error;
        });
    }

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
