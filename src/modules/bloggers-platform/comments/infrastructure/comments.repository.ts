import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private commentsRepo: Repository<Comment>,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    return this.commentsRepo.findOne({ where: { id } });
  }

  async save(comment: Comment): Promise<void> {
    await this.commentsRepo.save(comment);
  }

  async findOrNotFoundFail(id: string): Promise<Comment> {
    const comment = await this.findById(id);
    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    return comment;
  }
}
