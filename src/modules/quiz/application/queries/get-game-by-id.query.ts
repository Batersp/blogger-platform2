import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuizQueryRepository } from '../../infrastructure/query/quiz.query-repository';
import { GamePairViewDto } from '../../api/view-dto/game.view-dto';

export class GetGameByIdQuery {
  constructor(
    public readonly gameId: string,
    public readonly userId: string,
  ) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdQueryHandler implements IQueryHandler<GetGameByIdQuery> {
  constructor(private quizQueryRepository: QuizQueryRepository) {}

  async execute(query: GetGameByIdQuery): Promise<GamePairViewDto> {
    return this.quizQueryRepository.getGameById(query.gameId, query.userId);
  }
}
