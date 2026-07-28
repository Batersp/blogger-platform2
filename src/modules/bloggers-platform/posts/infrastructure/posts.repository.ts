import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private postsRepo: Repository<Post>,
  ) {}

  async save(post: Post): Promise<void> {
    await this.postsRepo.save(post);
  }

  async findById(id: string): Promise<Post | null> {
    return this.postsRepo.findOne({ where: { id } });
  }

  async findOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.findById(id);
    if (!post) throw new NotFoundException('post not found');
    return post;
  }
}
