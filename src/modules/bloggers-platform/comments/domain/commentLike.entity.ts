import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';
import { CreateCommentLikeDomainDto } from './dto/create-commentLike.domain.dto';

export class CommentLike {
  id: string;
  commentId: string;
  userId: string;
  userLogin: string;
  likeStatus: LIKE_STATUS;
  createdAt: Date;
  updatedAt: Date;

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
