import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';

export class GetCommentByIdQuery {
  constructor(
    public commentId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  async execute({
    commentId,
    userId,
  }: GetCommentByIdQuery): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(
      commentId,
      userId,
    );
  }
}
