import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { UpdateCommentDomainDto } from './dto/update-comment.domain.dto';
import { LIKE_STATUS } from '../../../../core/enums/likeStatus.enum';

@Schema()
export class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 1000 })
  content: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: Number, required: true })
  likesCount: number;

  @Prop({ type: Number, required: true })
  dislikesCount: number;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateCommentDomainDto): CommentDocument {
    const comment = new this();

    comment.content = dto.content;
    comment.commentatorInfo = dto.commentatorInfo;
    comment.postId = dto.postId;
    comment.likesCount = 0;
    comment.dislikesCount = 0;
    comment.deletedAt = null;

    return comment as CommentDocument;
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

export const CommentsSchema = SchemaFactory.createForClass(Comment);
CommentsSchema.loadClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
