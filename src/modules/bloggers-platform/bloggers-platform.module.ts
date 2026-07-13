import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogService } from './blogs/application/blog.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostService } from './posts/application/post.service';
import { CommentsController } from './comments/api/comments.controller';
import { CommentService } from './comments/application/comment.service';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CommentLikesRepository } from './comments/infrastructure/comment-likes.repository';
import { PostLikesRepository } from './posts/infrastructure/post-likes.repository';
import { GetAllBlogsQueryHandler } from './blogs/application/queries/get-blogs.query';
import { GetPostsForBlogQueryHandler } from './blogs/application/queries/get-postsForBlog.query';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blogById';
import { GetAllPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { SaBlogsController } from './blogs/api/saBlogs.controller';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { UpdateLikeStatusUseCase } from './comments/application/usecases/update-commentLikeStatus.useCase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { UpdatePostLikeStatusUseCase } from './posts/application/usecases/update-postLikeStatus.useCase';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-postById.query';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-commentById.query';
import { GetCommentsForPostQueryHandler } from './comments/application/queries/get-comments.query';

const queryHandlers = [
  GetAllBlogsQueryHandler,
  GetPostsForBlogQueryHandler,
  GetBlogByIdQueryHandler,
  GetAllPostsQueryHandler,
  GetPostByIdQueryHandler,
  GetCommentByIdQueryHandler,
  GetCommentsForPostQueryHandler,
];

const commandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  UpdateLikeStatusUseCase,
  DeleteCommentUseCase,
  UpdatePostLikeStatusUseCase,
];

@Module({
  imports: [UserAccountsModule],
  controllers: [
    BlogsController,
    SaBlogsController,
    PostsController,
    CommentsController,
  ],
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
    ...queryHandlers,
    ...commandHandlers,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
