import { Injectable, NotFoundException } from '@nestjs/common';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private blogsRepo: Repository<Blog>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.blogsRepo.findOne({ where: { id } });

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const qb = this.blogsRepo.createQueryBuilder('b');

    if (query.searchNameTerm) {
      qb.andWhere('b.name ILIKE :searchNameTerm', {
        searchNameTerm: `%${query.searchNameTerm}%`,
      });
    }

    const stringColumns = ['name', 'description', 'websiteUrl'];
    if (stringColumns.includes(query.sortBy)) {
      qb.orderBy(
        `b.${query.sortBy} COLLATE "C"`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      qb.orderBy(
        `b.${query.sortBy}`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    qb.skip(query.calculateSkip()).take(query.pageSize);

    const [blogs, totalCount] = await qb.getManyAndCount();

    return PaginatedViewDto.mapToView({
      items: blogs.map((blog) => BlogViewDto.mapToView(blog)),
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
