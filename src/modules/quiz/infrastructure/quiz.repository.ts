import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Game, GAME_STATUS } from '../domain/game.entity';
import { Question } from '../domain/question.entity';
import { GameQuestion } from '../domain/gameQuestion.entity';
import { Answer } from '../domain/answer.entity';

@Injectable()
export class QuizRepository {
  constructor(private readonly dataSource: DataSource) {}

  /** Один и тот же transactional runner используется и для connection, и для answer */
  async runInTransaction<T>(
    fn: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      const result = await fn(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async ensureUserHasNoActiveGame(
    manager: EntityManager,
    userId: string,
  ): Promise<void> {
    const existing = await manager
      .createQueryBuilder(Game, 'g')
      .where('(g.firstPlayerId = :userId OR g.secondPlayerId = :userId)', {
        userId,
      })
      .andWhere('g.status IN (:...statuses)', {
        statuses: [GAME_STATUS.PENDING_SECOND_PLAYER, GAME_STATUS.ACTIVE],
      })
      .getOne();

    if (existing) {
      throw new ForbiddenException(
        'Current user is already participating in active pair',
      );
    }
  }

  /** SELECT ... FOR UPDATE SKIP LOCKED — защита от гонки при одновременном join */
  async findPendingGameForUpdate(manager: EntityManager): Promise<Game | null> {
    return manager
      .createQueryBuilder(Game, 'g')
      .where('g.status = :status', {
        status: GAME_STATUS.PENDING_SECOND_PLAYER,
      })
      .orderBy('g.pairCreatedDate', 'ASC')
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .getOne();
  }

  async pickRandomQuestions(
    manager: EntityManager,
    count: number,
  ): Promise<Question[]> {
    return manager
      .createQueryBuilder(Question, 'q')
      .where('q.published = true')
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }

  async saveGameQuestions(
    manager: EntityManager,
    gameId: string,
    questions: Question[],
  ): Promise<void> {
    const rows = questions.map((q, index) => {
      const gq = new GameQuestion();
      gq.gameId = gameId;
      gq.questionId = q.id;
      gq.index = index;
      return gq;
    });
    await manager.save(GameQuestion, rows);
  }

  async findActiveGameForUpdate(
    manager: EntityManager,
    userId: string,
  ): Promise<Game | null> {
    return manager
      .createQueryBuilder(Game, 'g')
      .where('(g.firstPlayerId = :userId OR g.secondPlayerId = :userId)', {
        userId,
      })
      .andWhere('g.status = :status', { status: GAME_STATUS.ACTIVE })
      .setLock('pessimistic_write')
      .getOne();
  }

  async getGameQuestionsOrdered(
    manager: EntityManager,
    gameId: string,
  ): Promise<GameQuestion[]> {
    return manager.find(GameQuestion, {
      where: { gameId },
      relations: { question: true }, // важно!
      order: { index: 'ASC' },
    });
  }

  async getAnswersByPlayer(
    manager: EntityManager,
    gameId: string,
    playerId: string,
  ): Promise<Answer[]> {
    return manager.find(Answer, { where: { gameId, playerId } });
  }

  async getAllAnswers(
    manager: EntityManager,
    gameId: string,
  ): Promise<Answer[]> {
    return manager.find(Answer, { where: { gameId } });
  }

  async saveAnswer(manager: EntityManager, answer: Answer): Promise<Answer> {
    return manager.save(Answer, answer);
  }

  async saveGame(manager: EntityManager, game: Game): Promise<Game> {
    return manager.save(Game, game);
  }
}
