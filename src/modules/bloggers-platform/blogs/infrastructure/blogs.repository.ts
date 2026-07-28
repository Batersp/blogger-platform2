import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private blogsRepo: Repository<Blog>,
  ) {}

  async save(blog: Blog): Promise<void> {
    await this.blogsRepo.save(blog);
  }

  async findById(id: string): Promise<Blog | null> {
    return this.blogsRepo.findOne({ where: { id: id } });
  }

  async findOrNotFoundFail(id: string): Promise<Blog> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return blog;
  }

  async deleteBlog(blogId: string): Promise<void> {
    await this.blogsRepo.softDelete(blogId);
  }
}
