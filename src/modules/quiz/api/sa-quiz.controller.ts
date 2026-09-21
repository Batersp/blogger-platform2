import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from '../infrastructure/query/questions.query-repository';
import { GetQuestionsQueryParams } from './input-dto/get-questions-query-params.input-dto';
import { GetQuestionsQuery } from '../application/queries/get-questions.query';
import { QuestionInputDto } from './input-dto/question.input-dto';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { UpdateQuestionCommand } from '../application/usecases/update-question.usecase';
import { PublishQuestionInputDto } from './input-dto/publish-question.input-dto';
import { PublishQuestionCommand } from '../application/usecases/publish-question.usecase';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { QuestionViewDto } from './view-dto/question.view-dto';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class SaQuizQuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    return this.queryBus.execute(new GetQuestionsQuery(query));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: QuestionInputDto) {
    const question = await this.commandBus.execute(
      new CreateQuestionCommand(dto),
    );
    return this.questionsQueryRepository.getByIdOrNotFoundFail(question.id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: QuestionInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateQuestionCommand(id, dto));
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishQuestionInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new PublishQuestionCommand(id, dto.published),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute(new DeleteQuestionCommand(id));
  }
}
