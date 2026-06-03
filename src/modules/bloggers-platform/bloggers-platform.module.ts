import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogService } from './blogs/application/blog.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { PostsController } from './posts/api/posts.controller';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostService } from './posts/application/post.service';
import { CommentsController } from './comments/api/comments.controller';
import { CommentService } from './comments/application/comment.service';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { Comment, CommentsSchema } from './comments/domain/comment.entity';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import {
  CommentLike,
  CommentLikeSchema,
} from './comments/domain/commentLike.entity';
import { CommentLikesRepository } from './comments/infrastructure/comment-likes.repository';
import { PostLikesRepository } from './posts/infrastructure/post-likes.repository';
import { PostLike, PostLikeSchema } from './posts/domain/postLike.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: Comment.name, schema: CommentsSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogService,
    BlogsRepository,
    BlogsQueryRepository,
    PostService,
    PostsRepository,
    PostLikesRepository,
    PostsQueryRepository,
    CommentService,
    CommentsQueryRepository,
    CommentsRepository,
    CommentLikesRepository,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
