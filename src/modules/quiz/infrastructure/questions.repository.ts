import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question) private readonly repo: Repository<Question>,
  ) {}

  async save(question: Question): Promise<Question> {
    return this.repo.save(question);
  }

  async findByIdOrNotFoundFail(id: string): Promise<Question> {
    const question = await this.repo.findOneBy({ id });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.repo.softDelete({ id });
    if (!result.affected) {
      throw new NotFoundException('Question not found');
    }
  }
}
