import { Column, Entity } from 'typeorm';
import { BaseDBEntity } from '../../../core/entities/base.entity';
import { CreateQuestionDomainDto } from './dto/create-question.domain.dto';
import { UpdateQuestionDomainDto } from './dto/update-question.domain.dto';

export enum QuestionPublishStatus {
  Published = 'Published',
  Unpublished = 'Unpublished',
}

@Entity({ name: 'questions' })
export class Question extends BaseDBEntity {
  @Column()
  body: string;

  @Column({ type: 'jsonb' })
  correctAnswers: string[];

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null = null;

  static createInstance(dto: CreateQuestionDomainDto): Question {
    const question = new Question();
    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.published = false;
    question.deletedAt = null;
    question.createdAt = new Date();
    question.updatedAt = null;
    return question;
  }

  update(dto: UpdateQuestionDomainDto): void {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
    this.updatedAt = new Date();
  }

  setPublishStatus(published: boolean): void {
    this.published = published;
    this.updatedAt = new Date();
  }

  hasCorrectAnswers(): boolean {
    return Array.isArray(this.correctAnswers) && this.correctAnswers.length > 0;
  }
}
