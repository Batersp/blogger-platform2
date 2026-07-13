import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';

export class GetAllPostsQuery {
  constructor(
    public query: GetPostsQueryParams,
    public userId?: string,
  ) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsQueryHandler implements IQueryHandler<GetAllPostsQuery> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({
    query,
    userId,
  }: GetAllPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query, undefined, userId);
  }
}
