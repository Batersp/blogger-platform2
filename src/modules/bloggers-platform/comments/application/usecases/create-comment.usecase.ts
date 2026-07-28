import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { Comment } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';

interface CreateCommentCommandProps {
  content: string;
  postId: string;
  userId: string;
}

export class CreateCommentCommand extends Command<string> {
  content: string;
  postId: string;
  userId: string;
  constructor(public init: CreateCommentCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<
  CreateCommentCommand,
  string
> {
  constructor(
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({
    content,
    postId,
    userId,
  }: CreateCommentCommand): Promise<string> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);
    await this.postsRepository.findOrNotFoundFail(postId);
    const comment = Comment.createInstance({
      postId,
      content,
      commentatorInfo: {
        userId,
        userLogin: user.login,
      },
    });
    await this.commentsRepository.save(comment);
    return comment.id;
  }
}
