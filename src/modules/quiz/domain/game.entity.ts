import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseDBEntity } from '../../../core/entities/base.entity';
import { User } from '../../user-accounts/domain/user.entity';
import { GameQuestion } from './gameQuestion.entity';
import { Answer } from './answer.entity';

export enum GAME_STATUS {
  PENDING_SECOND_PLAYER = 'PendingSecondPlayer',
  ACTIVE = 'Active',
  FINISHED = 'Finished',
}

@Entity()
export class Game extends BaseDBEntity {
  @UpdateDateColumn()
  updatedAt: Date | null;

  @Column({
    type: 'enum',
    enum: GAME_STATUS,
    default: GAME_STATUS.PENDING_SECOND_PLAYER,
  })
  status: GAME_STATUS;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'firstPlayerId' })
  firstPlayer: User;
  @Column() firstPlayerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'secondPlayerId' })
  secondPlayer: User | null;
  @Column({ nullable: true }) secondPlayerId: string | null;

  @OneToMany(() => GameQuestion, (gq) => gq.game)
  gameQuestions: GameQuestion[];

  @OneToMany(() => Answer, (a) => a.game)
  answers: Answer[];

  @Column({ type: 'timestamptz' })
  pairCreatedDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  finishGameDate: Date | null;

  // денормализуем финальный счёт — считаем один раз при завершении игры,
  // чтобы не пересчитывать бонус на каждый GET
  @Column({ type: 'int', nullable: true })
  firstPlayerScore: number | null;

  @Column({ type: 'int', nullable: true })
  secondPlayerScore: number | null;

  static createPending(firstPlayerId: string): Game {
    const game = new Game();
    game.status = GAME_STATUS.PENDING_SECOND_PLAYER;
    game.firstPlayerId = firstPlayerId;
    game.secondPlayerId = null;
    game.pairCreatedDate = new Date();
    game.startGameDate = null;
    game.finishGameDate = null;
    game.firstPlayerScore = null;
    game.secondPlayerScore = null;
    game.deletedAt = null;
    game.createdAt = new Date();
    game.updatedAt = new Date();
    return game;
  }

  activate(secondPlayerId: string): void {
    this.secondPlayerId = secondPlayerId;
    this.status = GAME_STATUS.ACTIVE;
    this.startGameDate = new Date();
    this.updatedAt = new Date();
  }

  finish(firstPlayerScore: number, secondPlayerScore: number): void {
    this.status = GAME_STATUS.FINISHED;
    this.finishGameDate = new Date();
    this.firstPlayerScore = firstPlayerScore;
    this.secondPlayerScore = secondPlayerScore;
    this.updatedAt = new Date();
  }
}
