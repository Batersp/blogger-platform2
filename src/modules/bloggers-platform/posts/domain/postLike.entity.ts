import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';
import { CreatePostLikeDomainDto } from './dto/create-postLike.domain.dto';

export class PostLike {
  id: string;
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LIKE_STATUS;
  createdAt: Date;
  updatedAt: Date;

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
