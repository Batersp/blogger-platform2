import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuizQueryRepository } from '../../infrastructure/query/quiz.query-repository';
import { MyStatisticViewDto } from '../../api/view-dto/my-statistic.view-dto';

export class GetMyStatisticQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetMyStatisticQuery)
export class GetMyStatisticQueryHandler implements IQueryHandler<GetMyStatisticQuery> {
  constructor(private readonly quizQueryRepository: QuizQueryRepository) {}

  async execute(query: GetMyStatisticQuery): Promise<MyStatisticViewDto> {
    return this.quizQueryRepository.getMyStatistic(query.userId);
  }
}
