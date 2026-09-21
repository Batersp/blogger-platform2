import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';
import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseDBEntity } from '../../../../core/entities/base.entity';
import { Blog } from '../../blogs/domain/blog.entity';
import { PostLike } from './postLike.entity';
import { Comment } from '../../comments/domain/comment.entity';

@Entity({ name: 'posts' })
export class Post extends BaseDBEntity {
  @UpdateDateColumn()
  updatedAt: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  shortDescription: string;

  @Column({ type: 'varchar', length: 2000, nullable: false })
  content: string;

  @Column({ type: 'uuid', nullable: true })
  blogId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: false })
  blogName: string;

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  dislikesCount: number;

  @ManyToOne(() => Blog, (blog) => blog.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  static createInstance(dto: CreatePostDomainDto, blogName: string): Post {
    const post = new Post();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = blogName;
    post.likesCount = 0;
    post.dislikesCount = 0;
    post.deletedAt = null;

    return post;
  }

  update(dto: UpdatePostDomainDto) {
    const { title, shortDescription, content, blogId } = dto;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
  }

  updateLikeStatus(oldStatus: LIKE_STATUS, newStatus: LIKE_STATUS) {
    if (oldStatus === LIKE_STATUS.LIKE) this.likesCount--;
    if (oldStatus === LIKE_STATUS.DISLIKE) this.dislikesCount--;
    if (newStatus === LIKE_STATUS.LIKE) this.likesCount++;
    if (newStatus === LIKE_STATUS.DISLIKE) this.dislikesCount++;
  }

  makeDeleted() {
    if (this.deletedAt != null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}
