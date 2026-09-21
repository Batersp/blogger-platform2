import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuizQueryRepository } from '../../infrastructure/query/quiz.query-repository';
import { GamePairViewDto } from '../../api/view-dto/game.view-dto';

export class GetCurrentGameQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetCurrentGameQuery)
export class GetCurrentGameQueryHandler implements IQueryHandler<GetCurrentGameQuery> {
  constructor(private quizQueryRepository: QuizQueryRepository) {}

  async execute(query: GetCurrentGameQuery): Promise<GamePairViewDto> {
    return this.quizQueryRepository.getCurrentGame(query.userId);
  }
}
