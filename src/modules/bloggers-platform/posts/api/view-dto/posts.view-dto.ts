import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { Post } from '../../domain/post.entity';

type NewestLike = {
  addedAt: Date;
  userId: string;
  login: string;
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string | null;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LIKE_STATUS;
    newestLikes: NewestLike[];
  };

  static mapToView(
    post: Post,
    myStatus: LIKE_STATUS = LIKE_STATUS.NONE,
    newestLikes: NewestLike[] = [],
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus,
      newestLikes,
    };

    return dto;
  }
}
