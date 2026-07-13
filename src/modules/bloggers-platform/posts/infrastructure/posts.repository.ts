import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private mapToDomain(row: Post): Post {
    const post = new Post();
    post.id = row.id;
    post.title = row.title;
    post.shortDescription = row.shortDescription;
    post.content = row.content;
    post.blogId = row.blogId;
    post.blogName = row.blogName;
    post.likesCount = row.likesCount;
    post.dislikesCount = row.dislikesCount;
    post.deletedAt = row.deletedAt;
    post.createdAt = row.createdAt;
    post.updatedAt = row.updatedAt;
    return post;
  }

  async findById(id: string): Promise<Post | null> {
    const [row]: [Post | null] = await this.dataSource.query(
      `SELECT * FROM posts WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async create(post: Post): Promise<void> {
    const [row]: [Post] = await this.dataSource.query(
      `INSERT INTO posts (title, "shortDescription", content, "blogId", "blogName", "likesCount", "dislikesCount", "deletedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 0, 0, NULL, NOW(), NOW())
       RETURNING id`,
      [
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
      ],
    );
    post.id = row.id;
  }

  async save(post: Post): Promise<void> {
    await this.dataSource.query(
      `UPDATE posts SET
        title = $1, "shortDescription" = $2, content = $3, "blogId" = $4,
        "blogName" = $5, "likesCount" = $6, "dislikesCount" = $7,
        "deletedAt" = $8, "updatedAt" = NOW()
       WHERE id = $9`,
      [
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
        post.likesCount,
        post.dislikesCount,
        post.deletedAt,
        post.id,
      ],
    );
  }

  async findOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.findById(id);
    if (!post) throw new NotFoundException('post not found');
    return post;
  }
}
