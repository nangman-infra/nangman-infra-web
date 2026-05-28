import { Inject, Injectable } from '@nestjs/common';
import {
  BlogPostPage,
  GetBlogPostsPageUseCase,
  PaginationInput,
} from './application/use-cases/get-blog-posts-page.use-case';
import {
  BLOG_SOURCE_PROVIDER,
  BlogSourceProviderPort,
} from './domain/ports/blog-source-provider.port';

@Injectable()
export class BlogService {
  constructor(
    private readonly getBlogPostsPageUseCase: GetBlogPostsPageUseCase,
    @Inject(BLOG_SOURCE_PROVIDER)
    private readonly sourceProvider: BlogSourceProviderPort,
  ) {}

  async getPostsPage(input: PaginationInput): Promise<BlogPostPage> {
    return this.getBlogPostsPageUseCase.execute(input);
  }

  async getAuthors(): Promise<{ authors: string[] }> {
    const sources = await this.sourceProvider.getEnabledSources();
    const authors = [...new Set(sources.map((source) => source.name))].sort(
      (a, b) => a.localeCompare(b, 'ko'),
    );
    return { authors };
  }
}
