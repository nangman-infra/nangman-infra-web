import { Controller, Get, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import {
  BlogPostPage,
  PaginationInput,
} from './application/use-cases/get-blog-posts-page.use-case';
import { BlogPostSort } from './domain/ports/blog-post-repository.port';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  async getPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('author') author?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ): Promise<BlogPostPage> {
    const input: PaginationInput = {
      page: this.parsePage(page),
      pageSize: this.parsePageSize(pageSize),
      ...(this.toNonEmpty(author) !== null && {
        author: this.toNonEmpty(author) as string,
      }),
      ...(this.toNonEmpty(search) !== null && {
        search: this.toNonEmpty(search) as string,
      }),
      ...(this.parseSort(sort) !== null && {
        sort: this.parseSort(sort) as BlogPostSort,
      }),
    };
    return this.blogService.getPostsPage(input);
  }

  @Get('authors')
  async getAuthors(): Promise<{ authors: string[] }> {
    return this.blogService.getAuthors();
  }

  private parsePage(raw: string | undefined): number {
    const parsed = Number.parseInt(raw ?? '', 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return DEFAULT_PAGE;
    }
    return parsed;
  }

  private parsePageSize(raw: string | undefined): number {
    const parsed = Number.parseInt(raw ?? '', 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return DEFAULT_PAGE_SIZE;
    }
    return Math.min(parsed, MAX_PAGE_SIZE);
  }

  private parseSort(raw: string | undefined): BlogPostSort | null {
    if (raw === 'latest' || raw === 'oldest' || raw === 'author') {
      return raw;
    }
    return null;
  }

  private toNonEmpty(raw: string | undefined): string | null {
    if (typeof raw !== 'string') {
      return null;
    }
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
