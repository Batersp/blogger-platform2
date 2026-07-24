import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentLike } from '../domain/commentLike.entity';

@Injectable()
export class CommentLikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private mapToDomain(row: CommentLike): CommentLike {
    const commentLike = new CommentLike();
    commentLike.id = row.id;
    commentLike.commentId = row.commentId;
    commentLike.userId = row.userId;
    commentLike.userLogin = row.userLogin;
    commentLike.likeStatus = row.likeStatus;
    commentLike.createdAt = row.createdAt;
    commentLike.updatedAt = row.updatedAt;

    return commentLike;
  }

  async findLike(
    commentId: string,
    userId: string,
  ): Promise<CommentLike | null> {
    const [row]: [CommentLike | null] = await this.dataSource.query(
      `SELECT * FROM "commentLikes" WHERE "commentId" = $1 AND "userId" = $2`,
      [commentId, userId],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async create(commentLike: CommentLike): Promise<void> {
    const [row]: [CommentLike] = await this.dataSource.query(
      `INSERT INTO "commentLikes" ("commentId", "userId", "userLogin", "likeStatus", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
      [
        commentLike.commentId,
        commentLike.userId,
        commentLike.userLogin,
        commentLike.likeStatus,
      ],
    );
    commentLike.id = row.id;
  }

  async save(commentLike: CommentLike): Promise<void> {
    await this.dataSource.query(
      `UPDATE "commentLikes" SET
        "likeStatus" = $1, "updatedAt" = NOW()
       WHERE id = $2`,
      [commentLike.likeStatus, commentLike.id],
    );
  }
}
