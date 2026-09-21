import { ArrayMinSize, IsArray, IsString, Length } from 'class-validator';

export class QuestionInputDto {
  @IsString()
  @Length(10, 500)
  body: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  correctAnswers: string[];
}
