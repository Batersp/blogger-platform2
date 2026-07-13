import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';

type NewestLike = {
  addedAt: Date;
  userId: string;
  login: string;
};

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<PostViewDto> {
    const [post] = await this.dataSource.query(
      `SELECT * FROM posts WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    if (!post) throw new NotFoundException('post not found');

    let myStatus = LIKE_STATUS.NONE;
    if (userId) {
      const [like] = await this.dataSource.query(
        `SELECT "likeStatus" FROM "postLikes" WHERE "postId" = $1 AND "userId" = $2`,
        [id, userId],
      );
      if (like) myStatus = like.likeStatus;
    }

    const newestLikesRows = await this.dataSource.query(
      `SELECT "userId", "userLogin", "createdAt" FROM "postLikes"
       WHERE "postId" = $1 AND "likeStatus" = $2
       ORDER BY "createdAt" DESC
       LIMIT 3`,
      [id, LIKE_STATUS.LIKE],
    );

    const newestLikes: NewestLike[] = newestLikesRows.map((row) => ({
      addedAt: row.createdAt,
      userId: row.userId,
      login: row.userLogin,
    }));

    return PostViewDto.mapToView(post, myStatus, newestLikes);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const params: any[] = [];
    let paramIndex = 1;
    let sql = `WHERE "deletedAt" IS NULL`;

    if (blogId) {
      sql += ` AND "blogId" = $${paramIndex++}`;
      params.push(blogId);
    }

    const stringColumns = ['title', 'shortDescription', 'content', 'blogName'];
    const orderBy = stringColumns.includes(query.sortBy)
      ? `"${query.sortBy}" COLLATE "C"`
      : `"${query.sortBy}"`;

    const posts = await this.dataSource.query(
      `SELECT * FROM posts
       ${sql}
       ORDER BY ${orderBy} ${query.sortDirection.toUpperCase()}
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, query.pageSize, query.calculateSkip()],
    );

    const [{ count }] = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM posts ${sql}`,
      params,
    );

    let likesMap = new Map<string, LIKE_STATUS>();
    const newestLikesMap = new Map<string, NewestLike[]>();

    if (posts.length > 0) {
      const postIds = posts.map((p) => p.id);

      if (userId) {
        const likes = await this.dataSource.query(
          `SELECT "postId", "likeStatus" FROM "postLikes"
           WHERE "postId" = ANY($1) AND "userId" = $2`,
          [postIds, userId],
        );
        likesMap = new Map(likes.map((l) => [l.postId, l.likeStatus]));
      }

      const newestLikesRows = await this.dataSource.query(
        `SELECT "postId", "userId", "userLogin", "createdAt" FROM (
           SELECT "postId", "userId", "userLogin", "createdAt",
             ROW_NUMBER() OVER (
               PARTITION BY "postId"
               ORDER BY "createdAt" DESC
             ) AS rn
           FROM "postLikes"
           WHERE "postId" = ANY($1) AND "likeStatus" = $2
         ) sub
         WHERE rn <= 3
         ORDER BY "postId", "createdAt" DESC`,
        [postIds, LIKE_STATUS.LIKE],
      );

      for (const row of newestLikesRows) {
        const entry: NewestLike = {
          addedAt: row.createdAt,
          userId: row.userId,
          login: row.userLogin,
        };
        const existing = newestLikesMap.get(row.postId) ?? [];
        existing.push(entry);
        newestLikesMap.set(row.postId, existing);
      }
    }

    return PaginatedViewDto.mapToView({
      items: posts.map((post) =>
        PostViewDto.mapToView(
          post,
          likesMap.get(post.id) ?? LIKE_STATUS.NONE,
          newestLikesMap.get(post.id) ?? [],
        ),
      ),
      totalCount: Number(count),
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
