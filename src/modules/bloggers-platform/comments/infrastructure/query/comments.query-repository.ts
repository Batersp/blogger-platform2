import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CommentLike } from '../../domain/commentLike.entity';
import { Comment } from '../../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private commentsRepo: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikesRepo: Repository<CommentLike>,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<CommentViewDto> {
    const comment = await this.commentsRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('comment not found');

    let myStatus = LIKE_STATUS.NONE;
    if (userId) {
      const like = await this.commentLikesRepo.findOne({
        where: { commentId: id, userId },
      });
      if (like) myStatus = like.likeStatus;
    }

    return CommentViewDto.mapToView(comment, myStatus);
  }

  async getAll(
    query: GetCommentsQueryParams,
    postId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const qb = this.commentsRepo.createQueryBuilder('c');

    if (postId) {
      qb.andWhere('c.postId = :postId', { postId });
    }

    const stringColumns = ['content', 'userLogin'];
    if (stringColumns.includes(query.sortBy)) {
      qb.orderBy(
        `c.${query.sortBy} COLLATE "C"`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      qb.orderBy(
        `c.${query.sortBy}`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    qb.skip(query.calculateSkip()).take(query.pageSize);

    const [comments, totalCount] = await qb.getManyAndCount();

    let likesMap = new Map<string, LIKE_STATUS>();
    if (userId && comments.length > 0) {
      const commentIds = comments.map((c) => c.id);
      const likes = await this.commentLikesRepo.find({
        where: { commentId: In(commentIds), userId },
      });
      likesMap = new Map(likes.map((l) => [l.commentId, l.likeStatus]));
    }

    return PaginatedViewDto.mapToView({
      items: comments.map((comment) =>
        CommentViewDto.mapToView(
          comment,
          likesMap.get(comment.id) ?? LIKE_STATUS.NONE,
        ),
      ),
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
