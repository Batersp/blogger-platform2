import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';
import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';

export class Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string | null;
  blogName: string;
  likesCount: number;
  dislikesCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreatePostDomainDto, blogName: string): Post {
    const post = new Post();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = blogName;
    post.likesCount = 0;
    post.dislikesCount = 0;
    post.deletedAt = null;

    return post;
  }

  update(dto: UpdatePostDomainDto) {
    const { title, shortDescription, content, blogId } = dto;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
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
