import { Injectable, NotFoundException } from '@nestjs/common';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { FilterQuery } from 'mongoose';
import { Post, type PostModelType } from '../../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { PostLike, type PostLikeModelType } from '../../domain/postLike.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }

    let myStatus = LIKE_STATUS.NONE;
    if (userId) {
      const like = await this.PostLikeModel.findOne({
        postId: id,
        userId,
      }).lean();
      if (like) myStatus = like.likeStatus;
    }

    return PostViewDto.mapToView(post, myStatus);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };
    if (blogId) {
      filter.blogId = blogId;
    }

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    const postIds = posts.map((p) => p._id.toString());
    const likes = userId
      ? await this.PostLikeModel.find({
          postId: { $in: postIds },
          userId,
        }).lean()
      : [];

    const likesMap = new Map(likes.map((l) => [l.postId, l.likeStatus]));

    const items = posts.map((post) =>
      PostViewDto.mapToView(
        post,
        likesMap.get(post._id.toString()) ?? LIKE_STATUS.NONE,
      ),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
