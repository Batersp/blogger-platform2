import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';
import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';

@Schema()
export class LikeDetails {
  @Prop({ type: Date, required: true })
  addedAt: Date;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  login: string;
}

export const LikeDetailsSchema = SchemaFactory.createForClass(LikeDetails);

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  title: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 1000 })
  shortDescription: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 2000 })
  content: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  blogId: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  blogName: string;

  @Prop({ type: Number, required: true })
  likesCount: number;

  @Prop({ type: Number, required: true })
  dislikesCount: number;

  @Prop({ type: [LikeDetailsSchema], default: [] })
  newestLikes: LikeDetails[];

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(
    dto: CreatePostDomainDto,
    blogName: string,
  ): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = blogName;
    post.newestLikes = [];
    post.likesCount = 0;
    post.dislikesCount = 0;
    post.deletedAt = null;

    return post as PostDocument;
  }

  update(dto: UpdatePostDomainDto) {
    const { title, shortDescription, content, blogId } = dto;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
  }

  updateLikeStatus(
    userId: string,
    userLogin: string,
    oldStatus: LIKE_STATUS,
    newStatus: LIKE_STATUS,
    isFirstLike: boolean,
  ) {
    if (oldStatus === LIKE_STATUS.LIKE) this.likesCount--;
    if (oldStatus === LIKE_STATUS.DISLIKE) this.dislikesCount--;
    if (newStatus === LIKE_STATUS.LIKE) this.likesCount++;
    if (newStatus === LIKE_STATUS.DISLIKE) this.dislikesCount++;

    // убираем из newestLikes если убрали лайк
    if (newStatus !== LIKE_STATUS.LIKE) {
      this.newestLikes = this.newestLikes.filter((l) => l.userId !== userId);
      return;
    }

    // добавляем только если лайкает впервые (никогда раньше не лайкал)
    if (isFirstLike) {
      this.newestLikes = [
        { addedAt: new Date(), userId, login: userLogin },
        ...this.newestLikes,
      ].slice(0, 3);
    }
  }

  makeDeleted() {
    if (this.deletedAt != null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
