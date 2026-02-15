import { Injectable } from '@nestjs/common';
import { BlogPost } from './blog.interface';
import { GetAllBlogPostsUseCase } from './application/use-cases/get-all-blog-posts.use-case';

@Injectable()
export class BlogService {
  constructor(
    private readonly getAllBlogPostsUseCase: GetAllBlogPostsUseCase,
  ) {}

  async getAllPosts(): Promise<BlogPost[]> {
    return this.getAllBlogPostsUseCase.execute();
  }
}
