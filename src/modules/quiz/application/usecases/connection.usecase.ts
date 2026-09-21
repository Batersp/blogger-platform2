import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../infrastructure/quiz.repository';
import { Game } from '../../domain/game.entity';

export class ConnectionCommand extends Command<string> {
  constructor(public userId: string) {
    super();
  }
}

const QUESTIONS_PER_GAME = 5;

@CommandHandler(ConnectionCommand)
export class ConnectionUseCase implements ICommandHandler<
  ConnectionCommand,
  string
> {
  constructor(private quizRepository: QuizRepository) {}

  async execute({ userId }: ConnectionCommand): Promise<string> {
    return this.quizRepository.runInTransaction(async (manager) => {
      await this.quizRepository.ensureUserHasNoActiveGame(manager, userId);

      // FOR UPDATE SKIP LOCKED — если два игрока одновременно жмут join,
      // только один из них получит эту строку, второй создаст свою пару
      const pendingGame =
        await this.quizRepository.findPendingGameForUpdate(manager);

      if (pendingGame) {
        pendingGame.activate(userId);
        const questions = await this.quizRepository.pickRandomQuestions(
          manager,
          QUESTIONS_PER_GAME,
        );
        await this.quizRepository.saveGameQuestions(
          manager,
          pendingGame.id,
          questions,
        );
        const saved = await this.quizRepository.saveGame(manager, pendingGame);
        return saved.id;
      }

      const newGame = Game.createPending(userId);
      const saved = await this.quizRepository.saveGame(manager, newGame);
      return saved.id;
    });
  }
}
