import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuizQueryRepository } from '../../infrastructure/query/quiz.query-repository';
import { GetMyGamesQueryParams } from '../../api/input-dto/get-my-games-query-params.input-dto';
import { GamePairViewDto } from '../../api/view-dto/game.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

export class GetMyGamesQuery {
  constructor(
    public readonly userId: string,
    public readonly queryParams: GetMyGamesQueryParams,
  ) {}
}

@QueryHandler(GetMyGamesQuery)
export class GetMyGamesQueryHandler implements IQueryHandler<GetMyGamesQuery> {
  constructor(private readonly quizQueryRepository: QuizQueryRepository) {}

  async execute(
    query: GetMyGamesQuery,
  ): Promise<PaginatedViewDto<GamePairViewDto[]>> {
    return this.quizQueryRepository.getMyGames(query.userId, query.queryParams);
  }
}
