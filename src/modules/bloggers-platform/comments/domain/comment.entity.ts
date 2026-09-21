import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { UpdateCommentDomainDto } from './dto/update-comment.domain.dto';
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
import { Post } from '../../posts/domain/post.entity';
import { CommentLike } from './commentLike.entity';

@Entity({ name: 'comments' })
export class Comment extends BaseDBEntity {
  @UpdateDateColumn()
  updatedAt: Date | null;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  content: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  userLogin: string;

  @Column({ type: 'uuid', nullable: false })
  postId: string;

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  dislikesCount: number;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @OneToMany(() => CommentLike, (like) => like.comment)
  likes: CommentLike[];

  static createInstance(dto: CreateCommentDomainDto): Comment {
    const comment = new Comment();

    comment.content = dto.content;
    comment.userId = dto.commentatorInfo.userId;
    comment.userLogin = dto.commentatorInfo.userLogin;
    comment.postId = dto.postId;
    comment.likesCount = 0;
    comment.dislikesCount = 0;
    comment.deletedAt = null;

    return comment;
  }

  update(dto: UpdateCommentDomainDto) {
    this.content = dto.content;
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
