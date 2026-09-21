// application/queries/get-questions.query.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from '../../infrastructure/query/questions.query-repository';
import { GetQuestionsQueryParams } from '../../api/input-dto/get-questions-query-params.input-dto';
import { QuestionViewDto } from '../../api/view-dto/question.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

export class GetQuestionsQuery {
  constructor(public readonly queryParams: GetQuestionsQueryParams) {}
}

@QueryHandler(GetQuestionsQuery)
export class GetQuestionsQueryHandler implements IQueryHandler<GetQuestionsQuery> {
  constructor(
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  async execute(
    query: GetQuestionsQuery,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    return this.questionsQueryRepository.getAll(query.queryParams);
  }
}
