import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto'; // подставь свой путь

export enum PublishedStatus {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}

export enum QuestionsSortBy {
  CreatedAt = 'createdAt',
  Body = 'body',
}

export class GetQuestionsQueryParams extends BaseQueryParams {
  sortBy: QuestionsSortBy = QuestionsSortBy.CreatedAt;

  @IsOptional()
  @IsString()
  bodySearchTerm: string | null = null;

  @IsOptional()
  @IsEnum(PublishedStatus)
  publishedStatus: PublishedStatus = PublishedStatus.All;
}
