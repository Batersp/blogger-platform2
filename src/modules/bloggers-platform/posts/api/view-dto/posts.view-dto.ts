import { PostDocument } from '../../domain/post.entity';
import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LIKE_STATUS;
    newestLikes: {
      addedAt: Date;
      userId: string;
      login: string;
    }[];
  };

  static mapToView(
    post: PostDocument,
    myStatus: LIKE_STATUS = LIKE_STATUS.NONE,
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post._id.toString();
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
      newestLikes: post.newestLikes.map((l) => ({
        addedAt: l.addedAt,
        userId: l.userId,
        login: l.login,
      })),
    };

    return dto;
  }
}
