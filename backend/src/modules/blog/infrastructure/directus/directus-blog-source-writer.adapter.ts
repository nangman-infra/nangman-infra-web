import { Injectable, Logger } from '@nestjs/common';
import { BlogSourceWriterPort } from '../../domain/ports/blog-source-writer.port';
import { DirectusHttpClient } from './directus-http-client';

const ERROR_MESSAGE_MAX_LENGTH = 1000;

@Injectable()
export class DirectusBlogSourceWriterAdapter implements BlogSourceWriterPort {
  private readonly logger = new Logger(DirectusBlogSourceWriterAdapter.name);
  private readonly path = '/items/blog_sources';

  constructor(private readonly http: DirectusHttpClient) {}

  async recordSuccess(sourceId: number, at: Date): Promise<void> {
    try {
      await this.http.patch(`${this.path}/${sourceId}`, {
        last_success_at: at.toISOString(),
        last_error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to record success for source ${sourceId}: ${message}`,
      );
    }
  }

  async recordError(sourceId: number, message: string): Promise<void> {
    try {
      await this.http.patch(`${this.path}/${sourceId}`, {
        last_error: this.truncate(message),
      });
    } catch (error: unknown) {
      const writeError = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to record error for source ${sourceId}: ${writeError}`,
      );
    }
  }

  private truncate(message: string): string {
    if (message.length <= ERROR_MESSAGE_MAX_LENGTH) {
      return message;
    }
    return `${message.slice(0, ERROR_MESSAGE_MAX_LENGTH - 3)}...`;
  }
}
