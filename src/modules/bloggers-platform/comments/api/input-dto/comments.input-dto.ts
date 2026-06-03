import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class CreateCommentInputDto {
  @Length(20, 300)
  @IsString()
  @IsNotEmpty()
  @Trim()
  content: string;
}

export class UpdateCommentInputDto {
  @Length(20, 300)
  @IsString()
  @IsNotEmpty()
  @Trim()
  content: string;
}

export class UpdateLikeStatusInputDto {
  @IsEnum(LIKE_STATUS)
  likeStatus: LIKE_STATUS;
}
