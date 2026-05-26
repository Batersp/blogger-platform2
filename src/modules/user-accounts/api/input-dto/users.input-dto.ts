//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsEmail, IsString, IsUUID, Length } from 'class-validator';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateUserInputDto {
  @IsString()
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  @Trim()
  login: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  password: string;

  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}

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
