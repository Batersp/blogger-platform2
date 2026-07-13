import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import {
  UpdateCommentInputDto,
  UpdateLikeStatusInputDto,
} from './input-dto/comments.input-dto';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { UpdateLikeStatusCommand } from '../application/usecases/update-commentLikeStatus.useCase';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { GetCommentByIdQuery } from '../application/queries/get-commentById.query';

@Controller('comments')
export class CommentsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentById(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute(new GetCommentByIdQuery(id, user?.id));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') id: string,
    @Body() body: UpdateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand({
        commentId: id,
        userId: user.id,
        dto: body,
      }),
    );
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateLikeStatus(
    @Param('id') id: string,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateLikeStatusCommand({
        commentId: id,
        userId: user.id,
        likeStatus: body.likeStatus,
      }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteCommentById(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteCommentCommand({
        userId: user.id,
        commentId: id,
      }),
    );
  }
}
