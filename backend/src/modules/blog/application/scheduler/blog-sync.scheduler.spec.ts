import { SyncBlogPostsUseCase } from '../use-cases/sync-blog-posts.use-case';
import { BlogSyncScheduler } from './blog-sync.scheduler';

describe('BlogSyncScheduler', () => {
  const syncUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<SyncBlogPostsUseCase>;

  let scheduler: BlogSyncScheduler;

  beforeEach(() => {
    jest.clearAllMocks();
    scheduler = new BlogSyncScheduler(syncUseCase);
  });

  it('runs sync once on bootstrap', async () => {
    syncUseCase.execute.mockResolvedValue({
      totalSources: 10,
      fetchedItems: 100,
      insertedPosts: 2,
      failedSources: [],
    });

    await scheduler.onApplicationBootstrap();

    expect(syncUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('runs sync on each cron tick', async () => {
    syncUseCase.execute.mockResolvedValue({
      totalSources: 10,
      fetchedItems: 100,
      insertedPosts: 0,
      failedSources: [],
    });

    await scheduler.handleCron();
    await scheduler.handleCron();

    expect(syncUseCase.execute).toHaveBeenCalledTimes(2);
  });

  it('skips overlapping sync while a previous run is in flight', async () => {
    let resolvePending: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      resolvePending = resolve;
    });
    syncUseCase.execute.mockImplementationOnce(async () => {
      await pending;
      return {
        totalSources: 10,
        fetchedItems: 100,
        insertedPosts: 0,
        failedSources: [],
      };
    });

    const firstRun = scheduler.handleCron();
    // Second invocation while first is still pending
    await scheduler.handleCron();
    expect(syncUseCase.execute).toHaveBeenCalledTimes(1);

    resolvePending?.();
    await firstRun;

    // After completion, next tick should run again
    syncUseCase.execute.mockResolvedValueOnce({
      totalSources: 10,
      fetchedItems: 100,
      insertedPosts: 0,
      failedSources: [],
    });
    await scheduler.handleCron();
    expect(syncUseCase.execute).toHaveBeenCalledTimes(2);
  });

  it('swallows sync errors so the scheduler keeps running', async () => {
    syncUseCase.execute.mockRejectedValueOnce(new Error('boom'));

    await expect(scheduler.handleCron()).resolves.toBeUndefined();

    syncUseCase.execute.mockResolvedValueOnce({
      totalSources: 0,
      fetchedItems: 0,
      insertedPosts: 0,
      failedSources: [],
    });
    await scheduler.handleCron();
    expect(syncUseCase.execute).toHaveBeenCalledTimes(2);
  });
});
