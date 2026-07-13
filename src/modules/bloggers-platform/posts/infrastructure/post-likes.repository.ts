import { Injectable } from '@nestjs/common';
import { PostLike } from '../domain/postLike.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostLikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private mapToDomain(row: PostLike): PostLike {
    const postLike = new PostLike();
    postLike.id = row.id;
    postLike.postId = row.postId;
    postLike.userId = row.userId;
    postLike.userLogin = row.userLogin;
    postLike.likeStatus = row.likeStatus;
    postLike.createdAt = row.createdAt;
    postLike.updatedAt = row.updatedAt;

    return postLike;
  }

  async findLike(postId: string, userId: string): Promise<PostLike | null> {
    const [row]: [PostLike | null] = await this.dataSource.query(
      `SELECT * FROM "postLikes" WHERE "postId" = $1 AND "userId" = $2`,
      [postId, userId],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async create(postLike: PostLike): Promise<void> {
    const [row]: [PostLike] = await this.dataSource.query(
      `INSERT INTO "postLikes" ("postId", "userId", "userLogin", "likeStatus", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
      [
        postLike.postId,
        postLike.userId,
        postLike.userLogin,
        postLike.likeStatus,
      ],
    );
    postLike.id = row.id;
  }

  async save(postLike: PostLike): Promise<void> {
    await this.dataSource.query(
      `UPDATE "postLikes" SET
        "likeStatus" = $1, "updatedAt" = NOW()
       WHERE id = $2`,
      [postLike.likeStatus, postLike.id],
    );
  }
}
