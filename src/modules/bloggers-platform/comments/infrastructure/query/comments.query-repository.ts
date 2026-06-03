import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import {
  CommentLike,
  type CommentLikeModelType,
} from '../../domain/commentLike.entity';
import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
      throw new NotFoundException('comment not found');
    }

    let myStatus = LIKE_STATUS.NONE;
    if (userId) {
      const like = await this.CommentLikeModel.findOne({
        commentId: id,
        userId,
      }).lean();
      if (like) myStatus = like.likeStatus;
    }

    return CommentViewDto.mapToView(comment, myStatus);
  }

  async getAll(
    query: GetCommentsQueryParams,
    postId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter: FilterQuery<Comment> = { deletedAt: null };
    if (postId) filter.postId = postId;

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

    // Один запрос для всех лайков текущего пользователя
    const commentIds = comments.map((c) => c._id.toString());
    const likes = userId
      ? await this.CommentLikeModel.find({
          commentId: { $in: commentIds },
          userId,
        }).lean()
      : [];

    const likesMap = new Map(likes.map((l) => [l.commentId, l.likeStatus]));

    const items = comments.map((comment) =>
      CommentViewDto.mapToView(
        comment,
        likesMap.get(comment._id.toString()) ?? LIKE_STATUS.NONE,
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
