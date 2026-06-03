import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from '../domain/comment.entity';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';
import { CommentLikesRepository } from '../infrastructure/comment-likes.repository';
import {
  CommentLike,
  type CommentLikeModelType,
} from '../domain/commentLike.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentLikesRepository: CommentLikesRepository,
  ) {}

  async createComment(dto: CreateCommentDto): Promise<string> {
    const { content, postId, userId } = dto;
    const user = await this.usersRepository.findOrNotFoundFail(userId);
    await this.postsRepository.findOrNotFoundFail(postId);
    const comment = this.CommentModel.createInstance({
      content,
      postId,
      commentatorInfo: {
        userId: user._id.toString(),
        userLogin: user.login,
      },
    });
    await this.commentsRepository.save(comment);
    return comment._id.toString();
  }

  async updateComment(
    dto: UpdateCommentDto,
    commentId: string,
    userId: string,
  ): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);
    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException();
    }
    comment.update(dto);
    await this.commentsRepository.save(comment);
  }

  async updateLikeStatus(
    commentId: string,
    userId: string,
    newStatus: LIKE_STATUS,
  ): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);

    const existingLike = await this.commentLikesRepository.findLike(
      commentId,
      userId,
    );
    const oldStatus = existingLike?.likeStatus ?? LIKE_STATUS.NONE;

    if (oldStatus === newStatus) return;

    comment.updateLikeStatus(oldStatus, newStatus);
    await this.commentsRepository.save(comment);

    if (existingLike) {
      existingLike.updateLikeStatus(newStatus);
      await this.commentLikesRepository.save(existingLike);
    } else {
      const user = await this.usersRepository.findOrNotFoundFail(userId);
      const newLike = this.CommentLikeModel.createInstance({
        commentId,
        userId,
        userLogin: user.login,
        likeStatus: newStatus,
      });
      await this.commentLikesRepository.save(newLike);
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);
    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException('not allowed');
    }
    comment.makeDeleted();
    await this.commentsRepository.save(comment);
  }
}
