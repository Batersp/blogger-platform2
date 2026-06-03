import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';

export class CreateCommentLikeDomainDto {
  commentId: string;
  userId: string;
  userLogin: string;
  likeStatus: LIKE_STATUS;
}
