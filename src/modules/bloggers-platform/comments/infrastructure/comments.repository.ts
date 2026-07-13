import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private mapToDomain(row: Comment): Comment {
    const comment = new Comment();
    comment.id = row.id;
    comment.content = row.content;
    comment.userId = row.userId;
    comment.userLogin = row.userLogin;
    comment.postId = row.postId;
    comment.likesCount = row.likesCount;
    comment.dislikesCount = row.dislikesCount;
    comment.deletedAt = row.deletedAt;
    comment.createdAt = row.createdAt;
    comment.updatedAt = row.updatedAt;

    return comment;
  }

  async findById(id: string): Promise<Comment | null> {
    const [row]: [Comment | null] = await this.dataSource.query(
      `SELECT * FROM comments WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async create(comment: Comment): Promise<void> {
    const [row]: [Comment] = await this.dataSource.query(
      `INSERT INTO comments (content, "userId", "userLogin", "postId", "likesCount", "dislikesCount", "deletedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 0, 0, NULL, NOW(), NOW())
       RETURNING id`,
      [comment.content, comment.userId, comment.userLogin, comment.postId],
    );
    comment.id = row.id;
  }

  async save(comment: Comment): Promise<void> {
    await this.dataSource.query(
      `UPDATE comments SET
        content = $1, "likesCount" = $2, "dislikesCount" = $3,
        "deletedAt" = $4, "updatedAt" = NOW()
       WHERE id = $5`,
      [
        comment.content,
        comment.likesCount,
        comment.dislikesCount,
        comment.deletedAt,
        comment.id,
      ],
    );
  }

  async findOrNotFoundFail(id: string): Promise<Comment> {
    const comment = await this.findById(id);
    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    return comment;
  }
}
