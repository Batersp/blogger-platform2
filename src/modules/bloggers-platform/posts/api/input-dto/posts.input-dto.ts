import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { IsEnum, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class CreatePostInputDto {
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

  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  @Trim()
  blogId: string;
}

export class UpdatePostInputDto {
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

export class UpdateLikeStatusInputDto {
  @IsEnum(LIKE_STATUS)
  likeStatus: LIKE_STATUS;
}
