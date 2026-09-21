import { BaseDBEntity } from '../../../core/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
@Unique(['gameId', 'questionId'])
@Unique(['gameId', 'index'])
export class GameQuestion extends BaseDBEntity {
  @UpdateDateColumn()
  updatedAt: Date | null;

  @ManyToOne(() => Game, (g) => g.gameQuestions)
  @JoinColumn({ name: 'gameId' })
  game: Game;
  @Column() gameId: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId' })
  question: Question;
  @Column() questionId: string;

  // порядок вопроса в игре: 0..4, нужен, т.к. игроки отвечают последовательно
  @Column({ type: 'smallint' })
  index: number;
}
