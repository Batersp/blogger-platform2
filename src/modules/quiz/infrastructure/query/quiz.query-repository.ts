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
