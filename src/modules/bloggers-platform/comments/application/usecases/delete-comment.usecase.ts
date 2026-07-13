import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException } from '@nestjs/common';

interface DeleteCommentCommandProps {
  commentId: string;
  userId: string;
}

export class DeleteCommentCommand extends Command<void> {
  commentId: string;
  userId: string;
  constructor(public init: DeleteCommentCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<
  DeleteCommentCommand,
  void
> {
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ commentId, userId }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);

    if (comment.userId !== userId) {
      throw new ForbiddenException('not allowed');
    }

    comment.makeDeleted();
    await this.commentsRepository.save(comment);
  }
}
