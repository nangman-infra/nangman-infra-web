import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncBlogPostsUseCase } from '../use-cases/sync-blog-posts.use-case';

@Injectable()
export class BlogSyncScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(BlogSyncScheduler.name);
  private isRunning = false;

  constructor(private readonly syncUseCase: SyncBlogPostsUseCase) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.runSync('bootstrap');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron(): Promise<void> {
    await this.runSync('cron');
  }

  private async runSync(trigger: 'bootstrap' | 'cron'): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(`Sync skipped (${trigger}): previous run still active`);
      return;
    }
    this.isRunning = true;
    try {
      const result = await this.syncUseCase.execute();
      this.logger.log(
        `Sync (${trigger}) ok: sources=${result.totalSources} fetched=${result.fetchedItems} inserted=${result.insertedPosts} failed=${result.failedSources.length}`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Sync (${trigger}) failed: ${message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
