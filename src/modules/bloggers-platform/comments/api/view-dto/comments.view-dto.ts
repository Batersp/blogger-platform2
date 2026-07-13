import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { Comment } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LIKE_STATUS;
  };

  static mapToView(
    comment: Comment,
    myStatus: LIKE_STATUS = LIKE_STATUS.NONE,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.userId,
      userLogin: comment.userLogin,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus,
    };

    return dto;
  }
}
