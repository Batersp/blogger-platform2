import { Controller, Get, Param } from '@nestjs/common';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @Get(':id')
  async getCommentById(@Param('id') id: string): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
  }
}
