import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../domain/question.entity';
import { QuestionViewDto } from '../../api/view-dto/question.view-dto';
import {
  GetQuestionsQueryParams,
  PublishedStatus,
} from '../../api/input-dto/get-questions-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question) private readonly repo: Repository<Question>,
  ) {}

  async getAll(
    query: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const qb = this.repo.createQueryBuilder('q');

    if (query.bodySearchTerm) {
      qb.andWhere('q.body ILIKE :search', {
        search: `%${query.bodySearchTerm}%`,
      });
    }
    if (query.publishedStatus === PublishedStatus.Published) {
      qb.andWhere('q.published = true');
    } else if (query.publishedStatus === PublishedStatus.NotPublished) {
      qb.andWhere('q.published = false');
    }

    qb.orderBy(
      `q.${query.sortBy}`,
      query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
    )
      .skip(query.calculateSkip())
      .take(query.pageSize);

    const [items, totalCount] = await qb.getManyAndCount();

    return PaginatedViewDto.mapToView<QuestionViewDto[]>({
      items: items.map(this.mapToView),
      totalCount,
      page: query.pageNumber,
      size: query.pageSize, // ← именно size, не pageSize
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<QuestionViewDto> {
    const question = await this.repo.findOneBy({ id });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return this.mapToView(question);
  }

  private mapToView(q: Question): QuestionViewDto {
    return {
      id: q.id,
      body: q.body,
      correctAnswers: q.correctAnswers,
      published: q.published,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    };
  }
}
