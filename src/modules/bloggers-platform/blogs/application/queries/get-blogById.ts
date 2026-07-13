import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';

export class GetBlogByIdQuery {
  constructor(public blogId: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<GetBlogByIdQuery> {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute({ blogId }: GetBlogByIdQuery): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }
}
