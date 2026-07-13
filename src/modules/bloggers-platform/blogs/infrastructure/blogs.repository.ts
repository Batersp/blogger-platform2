import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private mapToDomain(row: Blog): Blog {
    const blog = new Blog();
    blog.id = row.id;
    blog.name = row.name;
    blog.description = row.description;
    blog.websiteUrl = row.websiteUrl;
    blog.isMembership = row.isMembership;
    blog.deletedAt = row.deletedAt;
    blog.createdAt = row.createdAt;
    blog.updatedAt = row.updatedAt;
    return blog;
  }

  async findById(id: string): Promise<Blog | null> {
    const [row]: [Blog | null] = await this.dataSource.query(
      `SELECT * FROM blogs WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async create(blog: Blog): Promise<void> {
    const [row]: [Blog] = await this.dataSource.query(
      `INSERT INTO blogs (name, description, "websiteUrl", "isMembership", "deletedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NULL, NOW(), NOW())
       RETURNING id`,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );
    blog.id = row.id;
  }

  async save(blog: Blog): Promise<void> {
    await this.dataSource.query(
      `UPDATE blogs SET
        name = $1, description = $2, "websiteUrl" = $3, "isMembership" = $4,
        "deletedAt" = $5, "updatedAt" = NOW()
       WHERE id = $6`,
      [
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.isMembership,
        blog.deletedAt,
        blog.id,
      ],
    );
  }

  async findOrNotFoundFail(id: string): Promise<Blog> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return blog;
  }
}
