import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<CommentViewDto> {
    const [comment] = await this.dataSource.query(
      `SELECT * FROM comments WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    if (!comment) throw new NotFoundException('comment not found');

    let myStatus = LIKE_STATUS.NONE;
    if (userId) {
      const [like] = await this.dataSource.query(
        `SELECT "likeStatus" FROM "commentLikes" WHERE "commentId" = $1 AND "userId" = $2`,
        [id, userId],
      );
      if (like) myStatus = like.likeStatus;
    }

    return CommentViewDto.mapToView(comment, myStatus);
  }

  async getAll(
    query: GetCommentsQueryParams,
    postId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const params: any[] = [];
    let paramIndex = 1;
    let sql = `WHERE "deletedAt" IS NULL`;

    if (postId) {
      sql += ` AND "postId" = $${paramIndex++}`;
      params.push(postId);
    }

    const stringColumns = ['content', 'userLogin'];
    const orderBy = stringColumns.includes(query.sortBy)
      ? `"${query.sortBy}" COLLATE "C"`
      : `"${query.sortBy}"`;

    const comments = await this.dataSource.query(
      `SELECT * FROM comments
       ${sql}
       ORDER BY ${orderBy} ${query.sortDirection.toUpperCase()}
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, query.pageSize, query.calculateSkip()],
    );

    const [{ count }] = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM comments ${sql}`,
      params,
    );

    let likesMap = new Map<string, LIKE_STATUS>();
    if (userId && comments.length > 0) {
      const commentIds = comments.map((c) => c.id);
      const likes = await this.dataSource.query(
        `SELECT "commentId", "likeStatus" FROM "commentLikes"
         WHERE "commentId" = ANY($1) AND "userId" = $2`,
        [commentIds, userId],
      );
      likesMap = new Map(likes.map((l) => [l.commentId, l.likeStatus]));
    }

    return PaginatedViewDto.mapToView({
      items: comments.map((comment) =>
        CommentViewDto.mapToView(
          comment,
          likesMap.get(comment.id) ?? LIKE_STATUS.NONE,
        ),
      ),
      totalCount: Number(count),
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
