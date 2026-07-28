import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { UpdateLikeStatusInputDto } from './input-dto/posts.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { CreateCommentInputDto } from '../../comments/api/input-dto/comments.input-dto';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllPostsQuery } from '../application/queries/get-posts.query';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { UpdatePostLikeStatusCommand } from '../application/usecases/update-postLikeStatus.useCase';
import { GetPostByIdQuery } from '../application/queries/get-postById.query';
import { GetCommentByIdQuery } from '../../comments/application/queries/get-commentById.query';
import { GetCommentsForPostQuery } from '../../comments/application/queries/get-comments.query';

@Controller('posts')
export class PostsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetAllPostsQuery(query, user?.id));
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(new GetPostByIdQuery(id, user?.id));
  }

  @Get(':id/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentsForPost(
    @Param('id') id: string,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute(
      new GetCommentsForPostQuery(id, query, user?.id),
    );
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @Body() body: CreateCommentInputDto,
    @Param('id') postId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand({
        postId,
        content: body.content,
        userId: user.id,
      }),
    );

    return this.queryBus.execute(new GetCommentByIdQuery(commentId));
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
      new UpdatePostLikeStatusCommand({
        postId: id,
        userId: user.id,
        likeStatus: body.likeStatus,
      }),
    );
  }

  /* @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.postService.deletePost(id);
  }*/
}
