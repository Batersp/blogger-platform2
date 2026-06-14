import { GetUsersQueryParams } from '../../../api/input-dto/get-users-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../infrastructure/query/users.query-repository';

export class GetAllUsersQuery {
  constructor(public query: GetUsersQueryParams) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async execute({ query }: GetAllUsersQuery) {
    return this.usersQueryRepository.getAll(query);
  }
}
