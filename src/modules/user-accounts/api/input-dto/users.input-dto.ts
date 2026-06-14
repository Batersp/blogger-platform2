//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsEmail, IsString, IsUUID, Length } from 'class-validator';
import { passwordConstraints } from '../../domain/user.entity';
import { Trim } from '../../../../core/decorators/transform/trim';
import { CreateUserCommand } from '../../application/usecases/users/create-user.usecase';

export class CreateUserInputDto extends CreateUserCommand {}

export class ConfirmEmailInputDto {
  @IsString()
  @IsUUID()
  @Trim()
  code: string;
}

export class ResendConfirmationCodeInputDto {
  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}

export class PasswordRecoveryInputDto {
  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}

export class CreateNewPasswordInputDto {
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  newPassword: string;

  @IsString()
  @IsUUID()
  @Trim()
  recoveryCode: string;
}
