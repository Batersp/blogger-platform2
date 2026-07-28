import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';
import { CreateCommentLikeDomainDto } from './dto/create-commentLike.domain.dto';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDBEntity } from '../../../../core/entities/base.entity';
import { Comment } from './comment.entity';

@Entity()
@Index(['commentId', 'userId'], { unique: true })
export class CommentLike extends BaseDBEntity {
  @Column({ type: 'uuid', nullable: false })
  commentId: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'varchar', nullable: false })
  userLogin: string;

  @Column({ type: 'enum', enum: LIKE_STATUS, nullable: false })
  likeStatus: LIKE_STATUS;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  static createInstance(dto: CreateCommentLikeDomainDto): CommentLike {
    const { commentId, userId, userLogin, likeStatus } = dto;
    const commentLike = new CommentLike();

    commentLike.commentId = commentId;
    commentLike.userId = userId;
    commentLike.userLogin = userLogin;
    commentLike.likeStatus = likeStatus;

    return commentLike;
  }

  updateLikeStatus(likeStatus: LIKE_STATUS) {
    this.likeStatus = likeStatus;
  }
}
