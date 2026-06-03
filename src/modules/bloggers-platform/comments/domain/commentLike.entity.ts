import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentLikeDomainDto } from './dto/create-commentLike.domain.dto';

@Schema({ timestamps: true })
export class CommentLike {
  @Prop({ type: String, required: true })
  commentId: string;

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

  static createInstance(dto: CreateCommentLikeDomainDto): CommentLikeDocument {
    const { commentId, userId, userLogin, likeStatus } = dto;
    const commentLike = new this();

    commentLike.commentId = commentId;
    commentLike.userId = userId;
    commentLike.userLogin = userLogin;
    commentLike.likeStatus = likeStatus;

    return commentLike as CommentLikeDocument;
  }

  updateLikeStatus(likeStatus: LIKE_STATUS) {
    this.likeStatus = likeStatus;
  }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
CommentLikeSchema.loadClass(CommentLike);
CommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });
export type CommentLikeDocument = HydratedDocument<CommentLike>;
export type CommentLikeModelType = Model<CommentLikeDocument> &
  typeof CommentLike;
