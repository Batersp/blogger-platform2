import { Injectable } from '@nestjs/common';
import { PostLike } from '../domain/postLike.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectRepository(PostLike)
    private postLikesRepo: Repository<PostLike>,
  ) {}

  async findLike(postId: string, userId: string): Promise<PostLike | null> {
    return this.postLikesRepo.findOne({ where: { postId, userId } });
  }

  async save(postLike: PostLike): Promise<void> {
    await this.postLikesRepo.save(postLike);
  }
}
