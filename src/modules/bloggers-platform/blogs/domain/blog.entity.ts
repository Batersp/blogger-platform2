import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDomainDto } from './dto/update-blog.domain.dto';
import { BaseDBEntity } from '../../../../core/entities/base.entity';
import { Column, Entity, OneToMany, UpdateDateColumn } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';

@Entity({ name: 'blogs' })
export class Blog extends BaseDBEntity {
  @UpdateDateColumn()
  updatedAt: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  description: string;

  @Column({ type: 'varchar', nullable: false })
  websiteUrl: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  static createInstance(dto: CreateBlogDomainDto): Blog {
    const blog = new Blog();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    blog.deletedAt = null;

    return blog;
  }

  update(dto: UpdateBlogDomainDto) {
    const { name, description, websiteUrl } = dto;
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }
}
