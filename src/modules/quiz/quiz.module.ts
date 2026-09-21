import { Module } from '@nestjs/common';
import { QuizController } from './api/quiz.controller';
import { QuizQueryRepository } from './infrastructure/query/quiz.query-repository';
import { GetCurrentGameQueryHandler } from './application/queries/get-currentGame.query';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './domain/game.entity';
import { Question } from './domain/question.entity';
import { Answer } from './domain/answer.entity';
import { GameQuestion } from './domain/gameQuestion.entity';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { ConnectionUseCase } from './application/usecases/connection.usecase';
import { SendAnswerUseCase } from './application/usecases/send-answer.usecase';
import { GetGameByIdQueryHandler } from './application/queries/get-game-by-id.query';
import { QuizRepository } from './infrastructure/quiz.repository';
import { CreateQuestionUseCase } from './application/usecases/create-question.usecase';
import { UpdateQuestionUseCase } from './application/usecases/update-question.usecase';
import { PublishQuestionUseCase } from './application/usecases/publish-question.usecase';
import { GetQuestionsQueryHandler } from './application/queries/get-questions.query';
import { SaQuizQuestionsController } from './api/sa-quiz.controller';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { QuestionsQueryRepository } from './infrastructure/query/questions.query-repository';
import { DeleteQuestionUseCase } from './application/usecases/delete-question.usecase';
import { GetMyStatisticQueryHandler } from './application/queries/get-my-statistic.query';
import { GetMyGamesQueryHandler } from './application/queries/get-my-games.query';

const queryHandlers = [
  GetCurrentGameQueryHandler,
  GetGameByIdQueryHandler,
  GetQuestionsQueryHandler,
  GetMyGamesQueryHandler,
  GetMyStatisticQueryHandler,
];

const commandHandlers = [
  ConnectionUseCase,
  SendAnswerUseCase,
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  PublishQuestionUseCase,
  DeleteQuestionUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, GameQuestion, Question, Answer]),
    UserAccountsModule,
  ],
  controllers: [QuizController, SaQuizQuestionsController],
  providers: [
    QuizQueryRepository,
    QuizRepository,
    QuestionsRepository,
    QuestionsQueryRepository,
    ...queryHandlers,
    ...commandHandlers,
  ],
  exports: [],
})
export class QuizModule {}
