import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDomainDto } from './dto/update-blog.domain.dto';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  name: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 1000 })
  description: string;

  @Prop({ type: String, required: true, minlength: 5, maxlength: 500 })
  websiteUrl: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    blog.deletedAt = null;

    return blog as BlogDocument;
  }

  update(dto: UpdateBlogDomainDto) {
    const { name, description, websiteUrl } = dto;
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }

  makeDeleted() {
    if (this.deletedAt != null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & typeof Blog;
