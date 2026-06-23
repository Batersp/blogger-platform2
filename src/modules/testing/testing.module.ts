import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { TestingService } from './application/testing.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Blog,
  BlogSchema,
} from '../bloggers-platform/blogs/domain/blog.entity';
import {
  Post,
  PostSchema,
} from '../bloggers-platform/posts/domain/post.entity';
import {
  Comment,
  CommentsSchema,
} from '../bloggers-platform/comments/domain/comment.entity';
import {
  CommentLike,
  CommentLikeSchema,
} from '../bloggers-platform/comments/domain/commentLike.entity';
import {
  PostLike,
  PostLikeSchema,
} from '../bloggers-platform/posts/domain/postLike.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentsSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingService],
  exports: [],
})
export class TestingModule {}
