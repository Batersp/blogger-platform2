import { Injectable, NotFoundException } from '@nestjs/common';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const { searchLoginTerm, searchEmailTerm, sortBy, sortDirection } = query;
    const skip = query.calculateSkip();

    const qb = this.usersRepo
      .createQueryBuilder('u')
      .where('u.deletedAt IS NULL');

    if (searchLoginTerm || searchEmailTerm) {
      qb.andWhere(
        new Brackets((qbInner) => {
          if (searchLoginTerm) {
            qbInner.orWhere('u.login ILIKE :searchLoginTerm', {
              searchLoginTerm: `%${searchLoginTerm}%`,
            });
          }
          if (searchEmailTerm) {
            qbInner.orWhere('u.email ILIKE :searchEmailTerm', {
              searchEmailTerm: `%${searchEmailTerm}%`,
            });
          }
        }),
      );
    }

    const stringColumns = ['login', 'email'];
    if (stringColumns.includes(sortBy)) {
      // COLLATE "C" для строковых колонок, чтобы сортировка была регистрозависимой/предсказуемой
      qb.addOrderBy(
        `u.${sortBy} COLLATE "C"`,
        sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      qb.orderBy(`u.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
    }

    qb.skip(skip).take(query.pageSize);

    const [users, totalCount] = await qb.getManyAndCount();

    const items = users.map((user) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
