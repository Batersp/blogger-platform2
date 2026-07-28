import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';
import { CreatePostLikeDomainDto } from './dto/create-postLike.domain.dto';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDBEntity } from '../../../../core/entities/base.entity';
import { Post } from './post.entity';

@Entity()
@Index(['postId', 'userId'], { unique: true })
export class PostLike extends BaseDBEntity {
  @Column({ type: 'varchar', nullable: false })
  postId: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'varchar', nullable: false })
  userLogin: string;

  @Column({ type: 'enum', enum: LIKE_STATUS, nullable: false })
  likeStatus: LIKE_STATUS;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  static createInstance(dto: CreatePostLikeDomainDto): PostLike {
    const { postId, userId, userLogin, likeStatus } = dto;
    const postLike = new PostLike();

    postLike.postId = postId;
    postLike.userId = userId;
    postLike.userLogin = userLogin;
    postLike.likeStatus = likeStatus;

    return postLike;
  }

  updateLikeStatus(likeStatus: LIKE_STATUS) {
    this.likeStatus = likeStatus;
  }
}
