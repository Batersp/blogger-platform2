import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLike } from '../../domain/postLike.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostLikesRepository } from '../../infrastructure/post-likes.repository';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';

interface UpdatePostLikeStatusCommandProps {
  postId: string;
  userId: string;
  likeStatus: LIKE_STATUS;
}

export class UpdatePostLikeStatusCommand extends Command<void> {
  postId: string;
  userId: string;
  likeStatus: LIKE_STATUS;
  constructor(public init: UpdatePostLikeStatusCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler<
  UpdatePostLikeStatusCommand,
  void
> {
  constructor(
    private postsRepository: PostsRepository,
    private postLikesRepository: PostLikesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    postId,
    userId,
    likeStatus: newStatus,
  }: UpdatePostLikeStatusCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(postId);

    const existingLike = await this.postLikesRepository.findLike(
      postId,
      userId,
    );
    const oldStatus = existingLike?.likeStatus ?? LIKE_STATUS.NONE;

    if (oldStatus === newStatus) return;

    post.updateLikeStatus(oldStatus, newStatus);
    await this.postsRepository.save(post);

    if (existingLike) {
      existingLike.updateLikeStatus(newStatus);
      await this.postLikesRepository.save(existingLike);
    } else {
      const user = await this.usersRepository.findOrNotFoundFail(userId);
      const newLike = PostLike.createInstance({
        postId,
        userId,
        userLogin: user.login,
        likeStatus: newStatus,
      });
      await this.postLikesRepository.save(newLike);
    }
  }
}
