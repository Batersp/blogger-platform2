import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerInputDto {
  @IsString()
  @IsNotEmpty()
  answer: string;
}
