import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { CommentLike } from '../../domain/commentLike.entity';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLikesRepository } from '../../infrastructure/comment-likes.repository';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';

interface UpdateLikeStatusCommandProps {
  commentId: string;
  userId: string;
  likeStatus: LIKE_STATUS;
}

export class UpdateLikeStatusCommand extends Command<void> {
  commentId: string;
  userId: string;
  likeStatus: LIKE_STATUS;
  constructor(public init: UpdateLikeStatusCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler<
  UpdateLikeStatusCommand,
  void
> {
  constructor(
    private commentsRepository: CommentsRepository,
    private commentLikesRepository: CommentLikesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    commentId,
    userId,
    likeStatus: newStatus,
  }: UpdateLikeStatusCommand): Promise<void> {
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
      const newLike = CommentLike.createInstance({
        commentId,
        userId,
        userLogin: user.login,
        likeStatus: newStatus,
      });
      await this.commentLikesRepository.create(newLike);
    }
  }
}
