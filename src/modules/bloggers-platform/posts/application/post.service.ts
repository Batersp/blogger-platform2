import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../domain/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(dto.blogId);
    const post = this.PostModel.createInstance(dto, blog.name);
    await this.postsRepository.save(post);
    return post._id.toString();
  }

  async updatePost(dto: UpdatePostDto, postId: string): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(postId);
    post.update(dto);
    await this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}
