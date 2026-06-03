import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';

export class CreatePostLikeDomainDto {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LIKE_STATUS;
}
