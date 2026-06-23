import { Injectable, NotFoundException } from '@nestjs/common';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const [user] = await this.dataSource.query(
      `SELECT id, login, email, "createdAt"
     FROM users
     WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    console.log(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    function buildWhere(
      searchLoginTerm: string | null,
      searchEmailTerm: string | null,
    ) {
      const params: any[] = [];
      const searchConditions: string[] = [];
      let paramIndex = 1;

      if (searchLoginTerm) {
        searchConditions.push(`login ILIKE $${paramIndex++}`);
        params.push(`%${searchLoginTerm}%`);
      }

      if (searchEmailTerm) {
        searchConditions.push(`email ILIKE $${paramIndex++}`);
        params.push(`%${searchEmailTerm}%`);
      }

      // deletedAt IS NULL — обязательное условие
      // поисковые условия объединяются через OR между собой
      let sql = `WHERE "deletedAt" IS NULL`;
      if (searchConditions.length > 0) {
        sql += ` AND (${searchConditions.join(' OR ')})`;
      }

      return { sql, params };
    }

    const {
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageSize,
    } = query;
    const skip = query.calculateSkip();

    // Собираем условия WHERE
    const conditions: string[] = ['"deletedAt" IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (searchLoginTerm) {
      conditions.push(`login ILIKE $${paramIndex++}`);
      params.push(`%${searchLoginTerm}%`);
    }

    if (searchEmailTerm) {
      conditions.push(`email ILIKE $${paramIndex++}`);
      params.push(`%${searchEmailTerm}%`);
    }

    const where = buildWhere(searchLoginTerm, searchEmailTerm);

    // Запрос данных
    const stringColumns = ['login', 'email'];
    const orderBy = stringColumns.includes(sortBy)
      ? `"${sortBy}" COLLATE "C"`
      : `"${sortBy}"`;

    const users = await this.dataSource.query(
      `SELECT id, login, email, "createdAt"
   FROM users
   ${where.sql}
   ORDER BY ${orderBy} ${sortDirection.toUpperCase()}
   LIMIT $${where.params.length + 1} OFFSET $${where.params.length + 2}`,
      [...where.params, pageSize, skip],
    );

    // Запрос общего количества
    const [{ count }] = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM users ${where.sql}`,
      where.params,
    );

    const items = users.map((user) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      items,
      totalCount: Number(count),
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
