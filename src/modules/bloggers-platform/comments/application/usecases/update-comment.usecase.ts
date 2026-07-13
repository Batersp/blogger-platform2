import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { ForbiddenException } from '@nestjs/common';

interface UpdateCommentCommandProps {
  commentId: string;
  userId: string;
  dto: UpdateCommentDto;
}

export class UpdateCommentCommand extends Command<void> {
  commentId: string;
  userId: string;
  dto: UpdateCommentDto;
  constructor(public init: UpdateCommentCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<
  UpdateCommentCommand,
  void
> {
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({
    commentId,
    userId,
    dto,
  }: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);
    if (comment.userId !== userId) {
      throw new ForbiddenException();
    }
    comment.update(dto);
    await this.commentsRepository.save(comment);
  }
}
