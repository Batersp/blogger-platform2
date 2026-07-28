import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentLike } from '../domain/commentLike.entity';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectRepository(CommentLike)
    private commentLikesRepo: Repository<CommentLike>,
  ) {}

  async findLike(
    commentId: string,
    userId: string,
  ): Promise<CommentLike | null> {
    return this.commentLikesRepo.findOne({ where: { commentId, userId } });
  }

  async save(commentLike: CommentLike): Promise<void> {
    await this.commentLikesRepo.save(commentLike);
  }
}
