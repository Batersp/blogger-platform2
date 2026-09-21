import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { GetCurrentGameQuery } from '../application/queries/get-currentGame.query';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/extract-user-from-request.decorator';
import { GamePairViewDto } from './view-dto/game.view-dto';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { GetGameByIdQuery } from '../application/queries/get-game-by-id.query';
import { ConnectionCommand } from '../application/usecases/connection.usecase';
import { AnswerInputDto } from './input-dto/answer.input-dto';
import { SendAnswerCommand } from '../application/usecases/send-answer.usecase';
import { GetMyGamesQueryParams } from './input-dto/get-my-games-query-params.input-dto';
import { GetMyGamesQuery } from '../application/queries/get-my-games.query';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetMyStatisticQuery } from '../application/queries/get-my-statistic.query';
import { MyStatisticViewDto } from './view-dto/my-statistic.view-dto';

@Controller('pair-game-quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get('pairs/my-current')
  async getCurrentGame(
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<GamePairViewDto> {
    return this.queryBus.execute(new GetCurrentGameQuery(user!.id));
  }

  @Get('pairs/my')
  async getMyGames(
    @Query() query: GetMyGamesQueryParams,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<GamePairViewDto[]>> {
    return this.queryBus.execute(new GetMyGamesQuery(user!.id, query));
  }

  @Get('users/my-statistic')
  async getMyStatistic(
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<MyStatisticViewDto> {
    return this.queryBus.execute(new GetMyStatisticQuery(user!.id));
  }

  @Get('pairs/:id')
  async getGameById(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<GamePairViewDto> {
    return this.queryBus.execute(new GetGameByIdQuery(id, user!.id));
  }

  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
  async connection(
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<GamePairViewDto> {
    const gameId = await this.commandBus.execute(
      new ConnectionCommand(user!.id),
    );
    return this.queryBus.execute(new GetGameByIdQuery(gameId, user!.id));
  }

  @Post('pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  async sendAnswer(
    @Body() dto: AnswerInputDto,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ) {
    const answer = await this.commandBus.execute(
      new SendAnswerCommand({ userId: user!.id, answer: dto.answer }),
    );
    return {
      questionId: answer.questionId,
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt,
    };
  }
}
