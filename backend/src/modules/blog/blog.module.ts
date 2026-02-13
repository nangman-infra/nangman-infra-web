import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600 * 1000, // 1 hour in ms
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
