import { Inject, Injectable } from '@nestjs/common';
import { BlogPost } from '../../domain/blog-post';
import {
  BLOG_POST_REPOSITORY,
  BlogPostRepositoryPort,
  BlogPostSort,
} from '../../domain/ports/blog-post-repository.port';

export interface PaginationInput {
  page: number;
  pageSize: number;
  author?: string;
  search?: string;
  sort?: BlogPostSort;
}

export interface BlogPostPage {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class GetBlogPostsPageUseCase {
  constructor(
    @Inject(BLOG_POST_REPOSITORY)
    private readonly repository: BlogPostRepositoryPort,
  ) {}

  async execute(input: PaginationInput): Promise<BlogPostPage> {
    const offset = (input.page - 1) * input.pageSize;
    const { posts, total } = await this.repository.findPage({
      offset,
      limit: input.pageSize,
      author: input.author,
      search: input.search,
      sort: input.sort,
    });

    const totalPages =
      input.pageSize > 0 ? Math.ceil(total / input.pageSize) : 0;

    return {
      posts,
      total,
      page: input.page,
      pageSize: input.pageSize,
      totalPages,
    };
  }
}
