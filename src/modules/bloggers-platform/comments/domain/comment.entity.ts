import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { UpdateCommentDomainDto } from './dto/update-comment.domain.dto';
import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';

export class Comment {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  postId: string;
  likesCount: number;
  dislikesCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

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
