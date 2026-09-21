import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { BaseDBEntity } from '../../../core/entities/base.entity';
import { Game } from './game.entity';
import { User } from '../../user-accounts/domain/user.entity';
import { Question } from './question.entity';

export enum ANSWER_STATUS {
  CORRECT = 'Correct',
  INCORRECT = 'Incorrect',
}
@Entity()
@Unique(['gameId', 'playerId', 'questionId'])
export class Answer extends BaseDBEntity {
  @UpdateDateColumn()
  updatedAt: Date | null;

  @ManyToOne(() => Game, (g) => g.answers)
  @JoinColumn({ name: 'gameId' })
  game: Game;
  @Column() gameId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'playerId' })
  player: User;
  @Column() playerId: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId' })
  question: Question;
  @Column() questionId: string;

  @Column({ type: 'enum', enum: ANSWER_STATUS })
  answerStatus: ANSWER_STATUS;

  @Column({ type: 'timestamptz' })
  addedAt: Date;

  static create(
    gameId: string,
    playerId: string,
    questionId: string,
    answerStatus: ANSWER_STATUS,
  ): Answer {
    const answer = new Answer();
    answer.gameId = gameId;
    answer.playerId = playerId;
    answer.questionId = questionId;
    answer.answerStatus = answerStatus;
    answer.addedAt = new Date();
    answer.deletedAt = null;
    answer.createdAt = new Date();
    answer.updatedAt = new Date();
    return answer;
  }
}
