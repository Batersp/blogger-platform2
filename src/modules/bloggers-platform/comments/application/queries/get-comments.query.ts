import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';

export class GetCommentsForPostQuery {
  constructor(
    public postId: string,
    public query: GetCommentsQueryParams,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentsForPostQuery)
export class GetCommentsForPostQueryHandler implements IQueryHandler<GetCommentsForPostQuery> {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({
    postId,
    query,
    userId,
  }: GetCommentsForPostQuery): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsRepository.findOrNotFoundFail(postId);
    return this.commentsQueryRepository.getAll(query, postId, userId);
  }
}
