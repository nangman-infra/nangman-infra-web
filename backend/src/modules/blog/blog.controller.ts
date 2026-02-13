import { Controller, Get } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogPost } from './blog.interface';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  async getPosts(): Promise<BlogPost[]> {
    return this.blogService.getAllPosts();
  }
}
