import { Injectable, NotFoundException } from '@nestjs/common';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const [blog] = await this.dataSource.query(
      `SELECT * FROM blogs WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const params: any[] = [];
    let paramIndex = 1;
    let sql = `WHERE "deletedAt" IS NULL`;

    if (query.searchNameTerm) {
      sql += ` AND name ILIKE $${paramIndex++}`;
      params.push(`%${query.searchNameTerm}%`);
    }

    const stringColumns = ['name', 'description', 'websiteUrl'];
    const orderBy = stringColumns.includes(query.sortBy)
      ? `"${query.sortBy}" COLLATE "C"`
      : `"${query.sortBy}"`;

    const blogs = await this.dataSource.query(
      `SELECT * FROM blogs
       ${sql}
       ORDER BY ${orderBy} ${query.sortDirection.toUpperCase()}
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, query.pageSize, query.calculateSkip()],
    );

    const [{ count }] = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM blogs ${sql}`,
      params,
    );

    return PaginatedViewDto.mapToView({
      items: blogs.map((blog) => BlogViewDto.mapToView(blog)),
      totalCount: Number(count),
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
