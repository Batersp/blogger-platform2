import { Injectable } from '@nestjs/common';
import {
  User,
  type UserModelType,
} from '../../user-accounts/domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  type BlogModelType,
} from '../../bloggers-platform/blogs/domain/blog.entity';
import {
  Post,
  type PostModelType,
} from '../../bloggers-platform/posts/domain/post.entity';
import {
  Comment,
  type CommentModelType,
} from '../../bloggers-platform/comments/domain/comment.entity';
import {
  CommentLike,
  type CommentLikeModelType,
} from '../../bloggers-platform/comments/domain/commentLike.entity';
import {
  PostLike,
  type PostLikeModelType,
} from '../../bloggers-platform/posts/domain/postLike.entity';

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    @InjectModel(PostLike.name)
    private PostLikeModel: PostLikeModelType,
  ) {}

  async deleteAllData(): Promise<void> {
    await Promise.all([
      this.UserModel.deleteMany({}),
      this.BlogModel.deleteMany({}),
      this.PostModel.deleteMany({}),
      this.CommentModel.deleteMany({}),
      this.CommentLikeModel.deleteMany({}),
      this.PostLikeModel.deleteMany({}),
    ]);
  }
}
