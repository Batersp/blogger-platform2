import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';

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
