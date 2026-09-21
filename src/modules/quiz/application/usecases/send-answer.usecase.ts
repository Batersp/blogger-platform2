// application/commands/send-answer.command.ts
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/quiz.repository';
import { Answer, ANSWER_STATUS } from '../../domain/answer.entity';
import { Game, GAME_STATUS } from '../../domain/game.entity';
import { EntityManager } from 'typeorm';

interface SendAnswerCommandProps {
  userId: string;
  answer: string;
}

export class SendAnswerCommand extends Command<Answer> {
  userId: string;
  answer: string;
  constructor(public init: SendAnswerCommandProps) {
    super();
    Object.assign(this, init);
  }
}

const QUESTIONS_PER_GAME = 5;

@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCase implements ICommandHandler<
  SendAnswerCommand,
  Answer
> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(command: SendAnswerCommand): Promise<Answer> {
    const { userId, answer } = command;

    return this.quizRepository.runInTransaction(async (manager) => {
      const game = await this.quizRepository.findActiveGameForUpdate(
        manager,
        userId,
      );
      if (!game) {
        throw new ForbiddenException('Current user is not inside active pair');
      }

      const gameQuestions = await this.quizRepository.getGameQuestionsOrdered(
        manager,
        game.id,
      );
      const myAnswers = await this.quizRepository.getAnswersByPlayer(
        manager,
        game.id,
        userId,
      );

      if (myAnswers.length >= QUESTIONS_PER_GAME) {
        throw new ForbiddenException(
          'User has already answered to all questions',
        );
      }

      // следующий неотвеченный вопрос — по порядку index
      const answeredQuestionIds = new Set(myAnswers.map((a) => a.questionId));

      const nextGameQuestion = gameQuestions.find(
        (gq) => !answeredQuestionIds.has(gq.questionId),
      );

      if (!nextGameQuestion) {
        // защитный случай — не должен происходить, т.к. myAnswers.length < 5,
        // но лучше явно упасть, чем допустить undefined ниже
        throw new Error('No unanswered question found for active game');
      }

      const question = nextGameQuestion.question;

      const isCorrect = question.correctAnswers
        .map((a) => a.trim().toLowerCase())
        .includes(answer.trim().toLowerCase());

      const savedAnswer = await this.quizRepository.saveAnswer(
        manager,
        Answer.create(
          game.id,
          userId,
          nextGameQuestion.questionId,
          isCorrect ? ANSWER_STATUS.CORRECT : ANSWER_STATUS.INCORRECT,
        ),
      );

      // проверяем, не закончилась ли игра этим ответом
      await this.tryFinishGame(manager, game);

      return savedAnswer;
    });
  }

  private async tryFinishGame(
    manager: EntityManager,
    game: Game,
  ): Promise<void> {
    if (game.status === GAME_STATUS.FINISHED) return;
    const allAnswers = await this.quizRepository.getAllAnswers(
      manager,
      game.id,
    );

    const firstAnswers = allAnswers
      .filter((a) => a.playerId === game.firstPlayerId)
      .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());
    const secondAnswers = allAnswers
      .filter((a) => a.playerId === game.secondPlayerId)
      .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());

    if (
      firstAnswers.length < QUESTIONS_PER_GAME ||
      secondAnswers.length < QUESTIONS_PER_GAME
    ) {
      return; // хотя бы один ещё не ответил на всё
    }

    const firstCorrect = firstAnswers.filter(
      (a) => a.answerStatus === ANSWER_STATUS.CORRECT,
    ).length;
    const secondCorrect = secondAnswers.filter(
      (a) => a.answerStatus === ANSWER_STATUS.CORRECT,
    ).length;

    const firstFinishedAt =
      firstAnswers[firstAnswers.length - 1].addedAt.getTime();
    const secondFinishedAt =
      secondAnswers[secondAnswers.length - 1].addedAt.getTime();

    let firstBonus = 0;
    let secondBonus = 0;
    if (firstFinishedAt < secondFinishedAt && firstCorrect > 0) {
      firstBonus = 1;
    } else if (secondFinishedAt < firstFinishedAt && secondCorrect > 0) {
      secondBonus = 1;
    }

    game.finish(firstCorrect + firstBonus, secondCorrect + secondBonus);
    await this.quizRepository.saveGame(manager, game);
  }
}
