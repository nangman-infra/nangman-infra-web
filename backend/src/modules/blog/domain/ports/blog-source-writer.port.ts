export const BLOG_SOURCE_WRITER = Symbol('BLOG_SOURCE_WRITER');

export interface BlogSourceWriterPort {
  recordSuccess(sourceId: number, at: Date): Promise<void>;
  recordError(sourceId: number, message: string): Promise<void>;
}
