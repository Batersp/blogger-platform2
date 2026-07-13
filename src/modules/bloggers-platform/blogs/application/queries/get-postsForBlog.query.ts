import { GetPostsQueryParams } from '../../../posts/api/input-dto/get-posts-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../../posts/api/view-dto/posts.view-dto';

export class GetPostsForBlogQuery {
  constructor(
    public query: GetPostsQueryParams,
    public blogId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostsForBlogQuery)
export class GetPostsForBlogQueryHandler implements IQueryHandler<GetPostsForBlogQuery> {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute({
    query,
    blogId,
    userId,
  }: GetPostsForBlogQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    return this.postsQueryRepository.getAll(query, blogId, userId);
  }
}
