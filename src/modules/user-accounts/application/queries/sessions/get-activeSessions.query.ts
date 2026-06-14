import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SecurityDevicesQueryRepository } from '../../../infrastructure/query/securityDevices.query-repository';

export class GetActiveSessionsQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetActiveSessionsQuery)
export class GetActiveSessionsQueryHandler implements IQueryHandler<GetActiveSessionsQuery> {
  constructor(
    private securityDevicesQueryRepository: SecurityDevicesQueryRepository,
  ) {}

  async execute({ userId }: GetActiveSessionsQuery) {
    return this.securityDevicesQueryRepository.findActiveSessionsById(userId);
  }
}
