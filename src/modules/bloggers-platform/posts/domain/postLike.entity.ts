import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostLikeDomainDto } from './dto/create-postLike.domain.dto';

@Schema({ timestamps: true })
export class PostLike {
  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;

  @Prop({
    type: String,
    enum: LIKE_STATUS,
    required: true,
  })
  likeStatus: LIKE_STATUS;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreatePostLikeDomainDto): PostLikeDocument {
    const { postId, userId, userLogin, likeStatus } = dto;
    const postLike = new this();

    postLike.postId = postId;
    postLike.userId = userId;
    postLike.userLogin = userLogin;
    postLike.likeStatus = likeStatus;

    return postLike as PostLikeDocument;
  }

  updateLikeStatus(likeStatus: LIKE_STATUS) {
    this.likeStatus = likeStatus;
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
PostLikeSchema.loadClass(PostLike);
PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
export type PostLikeDocument = HydratedDocument<PostLike>;
export type PostLikeModelType = Model<PostLikeDocument> & typeof PostLike;
