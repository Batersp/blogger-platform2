import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { GetAllBlogsQuery } from '../application/queries/get-blogs.query';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import {
  CreateBlogInputDTO,
  CreatePostForBlogInputDto,
  UpdateBlogInputDTO,
} from './input-dto/blogs.input-dto';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { GetBlogByIdQuery } from '../application/queries/get-blogById';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { CreatePostCommand } from '../../posts/application/usecases/create-post.usecase';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { GetPostsForBlogQuery } from '../application/queries/get-postsForBlog.query';
import { UpdatePostInputDto } from '../../posts/api/input-dto/posts.input-dto';
import { UpdatePostCommand } from '../../posts/application/usecases/update-post.usecase';
import { DeletePostCommand } from '../../posts/application/usecases/delete-post.usecase';
import { GetPostByIdQuery } from '../../posts/application/queries/get-postById.query';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetAllBlogsQuery(query));
  }

  @Get(':id/posts')
  @UseGuards(BasicAuthGuard)
  async getPostsForBlog(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsForBlogQuery(query, id, user?.id));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() body: CreateBlogInputDTO): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(body));
    return this.queryBus.execute(new GetBlogByIdQuery(blogId));
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('id') id: string,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(
      new CreatePostCommand({
        content: body.content,
        title: body.title,
        shortDescription: body.shortDescription,
        blogId: id,
      }),
    );

    return this.queryBus.execute(new GetPostByIdQuery(postId));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDTO,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateBlogCommand({
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
        blogId: id,
      }),
    );
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePostCommand({
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogId,
        postId,
      }),
    );
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(postId, blogId));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }
}
