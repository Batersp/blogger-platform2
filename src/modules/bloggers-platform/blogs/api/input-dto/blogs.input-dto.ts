import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class CreateBlogInputDTO {
  @Length(1, 15)
  @IsString()
  @IsNotEmpty()
  @Trim()
  name: string;

  @Length(1, 500)
  @IsString()
  @IsNotEmpty()
  @Trim()
  description: string;

  @Length(1, 100)
  @IsUrl()
  @IsString()
  @IsNotEmpty()
  @Trim()
  websiteUrl: string;
}

export class UpdateBlogInputDTO {
  @Length(1, 15)
  @IsString()
  @IsNotEmpty()
  @Trim()
  name: string;

  @Length(1, 500)
  @IsString()
  @IsNotEmpty()
  @Trim()
  description: string;

  @Length(1, 100)
  @IsUrl()
  @IsString()
  @IsNotEmpty()
  @Trim()
  websiteUrl: string;
}

export class CreatePostForBlogInputDto {
  @Length(1, 30)
  @IsString()
  @IsNotEmpty()
  @Trim()
  title: string;

  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  @Trim()
  shortDescription: string;

  @Length(1, 1000)
  @IsString()
  @IsNotEmpty()
  @Trim()
  content: string;
}
