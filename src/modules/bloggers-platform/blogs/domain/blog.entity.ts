import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDomainDto } from './dto/update-blog.domain.dto';

export class Blog {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateBlogDomainDto): Blog {
    const blog = new Blog();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    blog.deletedAt = null;

    return blog;
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
