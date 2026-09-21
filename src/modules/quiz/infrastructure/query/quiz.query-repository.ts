import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GAME_STATUS } from '../../domain/game.entity';
import { Repository } from 'typeorm';
import { User } from '../../../user-accounts/domain/user.entity';
import { Answer } from '../../domain/answer.entity';
import { GameQuestion } from '../../domain/gameQuestion.entity';
import {
  AnswerViewDto,
  GamePairViewDto,
  GamePlayerProgressViewDto,
  QuestionViewDto,
} from '../../api/view-dto/game.view-dto';
import { isUUID } from 'class-validator';
import { GetMyGamesQueryParams } from '../../api/input-dto/get-my-games-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { MyStatisticViewDto } from '../../api/view-dto/my-statistic.view-dto';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(Game) private readonly gameRepo: Repository<Game>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Answer) private readonly answerRepo: Repository<Answer>,
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepo: Repository<GameQuestion>,
  ) {}

  async getCurrentGame(userId: string): Promise<GamePairViewDto> {
    const game = await this.gameRepo
      .createQueryBuilder('g')
      .where('(g.firstPlayerId = :userId OR g.secondPlayerId = :userId)', {
        userId,
      })
      .andWhere('g.status IN (:...statuses)', {
        statuses: [GAME_STATUS.PENDING_SECOND_PLAYER, GAME_STATUS.ACTIVE],
      })
      .getOne();

    if (!game) {
      throw new NotFoundException('No active pair for current user');
    }
    return this.mapToView(game);
  }

  async getGameById(gameId: string, userId: string): Promise<GamePairViewDto> {
    if (!isUUID(gameId)) {
      throw new BadRequestException([
        { message: 'Invalid id format', field: 'id' },
      ]);
    }

    const game = await this.gameRepo.findOneBy({ id: gameId });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    if (game.firstPlayerId !== userId && game.secondPlayerId !== userId) {
      throw new ForbiddenException('You are not a participant of this game');
    }
    return this.mapToView(game);
  }

  async getMyGames(
    userId: string,
    query: GetMyGamesQueryParams,
  ): Promise<PaginatedViewDto<GamePairViewDto[]>> {
    const qb = this.gameRepo
      .createQueryBuilder('g')
      .where('(g.firstPlayerId = :userId OR g.secondPlayerId = :userId)', {
        userId,
      })
      .orderBy(
        `g.${query.sortBy}`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .addOrderBy('g.pairCreatedDate', 'DESC')
      .skip(query.calculateSkip())
      .take(query.pageSize);

    const [games, totalCount] = await qb.getManyAndCount();

    const items = await Promise.all(games.map((g) => this.mapToView(g)));

    return PaginatedViewDto.mapToView<GamePairViewDto[]>({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getMyStatistic(userId: string): Promise<MyStatisticViewDto> {
    const rows = await this.gameRepo
      .createQueryBuilder('g')
      .select([
        `CASE WHEN g.firstPlayerId = :userId THEN g.firstPlayerScore ELSE g.secondPlayerScore END AS "myScore"`,
        `CASE WHEN g.firstPlayerId = :userId THEN g.secondPlayerScore ELSE g.firstPlayerScore END AS "opponentScore"`,
      ])
      .where('(g.firstPlayerId = :userId OR g.secondPlayerId = :userId)', {
        userId,
      })
      .andWhere('g.status = :status', { status: GAME_STATUS.FINISHED })
      .setParameter('userId', userId)
      .getRawMany<{ myScore: number; opponentScore: number }>();

    if (rows.length === 0) {
      return {
        sumScore: 0,
        avgScores: 0,
        gamesCount: 0,
        winsCount: 0,
        lossesCount: 0,
        drawsCount: 0,
      };
    }

    const sumScore = rows.reduce((acc, r) => acc + Number(r.myScore), 0);
    const gamesCount = rows.length;
    const winsCount = rows.filter(
      (r) => Number(r.myScore) > Number(r.opponentScore),
    ).length;
    const lossesCount = rows.filter(
      (r) => Number(r.myScore) < Number(r.opponentScore),
    ).length;
    const drawsCount = rows.filter(
      (r) => Number(r.myScore) === Number(r.opponentScore),
    ).length;

    return {
      sumScore,
      avgScores: Math.round((sumScore / gamesCount) * 100) / 100, // округление до сотых
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount,
    };
  }

  private async mapToView(game: Game): Promise<GamePairViewDto> {
    const [firstPlayer, secondPlayer, answers, gameQuestions] =
      await Promise.all([
        this.userRepo.findOneBy({ id: game.firstPlayerId }),
        game.secondPlayerId
          ? this.userRepo.findOneBy({ id: game.secondPlayerId })
          : Promise.resolve(null),
        this.answerRepo.find({ where: { gameId: game.id } }),
        game.status !== GAME_STATUS.PENDING_SECOND_PLAYER
          ? this.gameQuestionRepo.find({
              where: { gameId: game.id },
              relations: { question: true },
              order: { index: 'ASC' },
            })
          : Promise.resolve(null),
      ]);

    const mapAnswers = (playerId: string): AnswerViewDto[] =>
      answers
        .filter((a) => a.playerId === playerId)
        .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
        .map((a) => ({
          questionId: a.questionId,
          answerStatus: a.answerStatus,
          addedAt: a.addedAt,
        }));

    const buildProgress = (
      player: User | null,
      score: number | null,
    ): GamePlayerProgressViewDto | null => {
      if (!player) return null;
      const playerAnswers = mapAnswers(player.id);
      return {
        answers: playerAnswers,
        player: { id: player.id, login: player.login },
        score:
          score ??
          playerAnswers.filter((a) => a.answerStatus === 'Correct').length,
      };
    };

    const questions: QuestionViewDto[] | null = gameQuestions
      ? gameQuestions.map((gq) => ({
          id: gq.question.id,
          body: gq.question.body,
        }))
      : null;

    return {
      id: game.id,
      firstPlayerProgress: buildProgress(firstPlayer, game.firstPlayerScore)!,
      secondPlayerProgress: buildProgress(secondPlayer, game.secondPlayerScore),
      questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
