import { GAME_STATUS } from '../../domain/game.entity';
import { ANSWER_STATUS } from '../../domain/answer.entity';

export class AnswerViewDto {
  questionId: string;
  answerStatus: ANSWER_STATUS;
  addedAt: Date;
}

export class PlayerViewDto {
  id: string;
  login: string;
}

export class GamePlayerProgressViewDto {
  answers: AnswerViewDto[];
  player: PlayerViewDto;
  score: number;
}

export class QuestionViewDto {
  id: string;
  body: string;
}

export class GamePairViewDto {
  id: string;
  firstPlayerProgress: GamePlayerProgressViewDto;
  secondPlayerProgress: GamePlayerProgressViewDto | null;
  questions: QuestionViewDto[] | null;
  status: GAME_STATUS;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}
