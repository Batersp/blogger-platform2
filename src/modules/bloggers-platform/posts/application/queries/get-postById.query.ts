import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';

export class GetPostByIdQuery {
  constructor(
    public postId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({ postId, userId }: GetPostByIdQuery): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId, userId);
  }
}
