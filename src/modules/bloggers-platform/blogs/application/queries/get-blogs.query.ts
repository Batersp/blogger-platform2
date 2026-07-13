import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';

export class GetAllBlogsQuery {
  constructor(public query: GetBlogsQueryParams) {}
}

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsQueryHandler implements IQueryHandler<GetAllBlogsQuery> {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute({
    query,
  }: GetAllBlogsQuery): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }
}
