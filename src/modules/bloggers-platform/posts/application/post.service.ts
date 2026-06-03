import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../domain/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { UpdatePostDto } from '../dto/update-post.dto';
import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';
import { PostLikesRepository } from '../infrastructure/post-likes.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { PostLike, type PostLikeModelType } from '../domain/postLike.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private postLikesRepository: PostLikesRepository,
    private usersRepository: UsersRepository,
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

  async updateLikeStatus(
    postId: string,
    userId: string,
    newStatus: LIKE_STATUS,
  ): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(postId);
    const user = await this.usersRepository.findOrNotFoundFail(userId);
    const existingLike = await this.postLikesRepository.findLike(
      postId,
      userId,
    );

    const oldStatus = existingLike?.likeStatus ?? LIKE_STATUS.NONE;

    if (oldStatus === newStatus) return;

    const isFirstLike = !existingLike;
    post.updateLikeStatus(
      userId,
      user.login,
      oldStatus,
      newStatus,
      isFirstLike,
    );
    await this.postsRepository.save(post);

    if (existingLike) {
      existingLike.updateLikeStatus(newStatus);
      await this.postLikesRepository.save(existingLike);
    } else {
      const newLike = this.PostLikeModel.createInstance({
        postId,
        userId,
        userLogin: user.login,
        likeStatus: newStatus,
      });

      await this.postLikesRepository.save(newLike);
    }
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}
