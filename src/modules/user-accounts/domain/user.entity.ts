import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { HydratedDocument, Model } from 'mongoose';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

@Schema()
export class EmailConfirmationInfo {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 1000 })
  confirmationCode: string;

  @Prop({ type: Date, required: true })
  expirationDate: Date;

  @Prop({ type: Boolean, required: true })
  isConfirmed: boolean;
}

export const EmailConfirmationInfoSchema = SchemaFactory.createForClass(
  EmailConfirmationInfo,
);

@Schema()
export class PasswordRecoveryInfo {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 1000 })
  recoveryCode: string;

  @Prop({ type: Date, required: true })
  expirationDate: Date;
}

export const PasswordRecoveryInfoSchema =
  SchemaFactory.createForClass(PasswordRecoveryInfo);

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true })
  login: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: EmailConfirmationInfoSchema, required: false, default: null })
  emailConfirmation: EmailConfirmationInfo | null;

  @Prop({ type: PasswordRecoveryInfoSchema, required: false, default: null })
  passwordRecovery: PasswordRecoveryInfo | null;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.email = dto.email;
    user.login = dto.login;
    user.passwordHash = dto.passwordHash;
    user.deletedAt = null;
    user.emailConfirmation = null;
    user.passwordRecovery = null;

    return user as UserDocument;
  }

  makeDeleted() {
    if (this.deletedAt != null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  setConfirmationCode(code: string, expirationDate: Date) {
    this.emailConfirmation = {
      confirmationCode: code,
      expirationDate: new Date(expirationDate),
      isConfirmed: false,
    };
  }

  confirmCode() {
    if (this.emailConfirmation) {
      this.emailConfirmation.isConfirmed = true;
    }
  }

  updateConfirmationCode(code: string, expirationDate: Date) {
    this.emailConfirmation = {
      confirmationCode: code,
      expirationDate,
      isConfirmed: false,
    };
  }

  savePasswordRecoveryCode(code: string, expirationDate: Date) {
    this.passwordRecovery = {
      recoveryCode: code,
      expirationDate: expirationDate,
    };
  }

  updatePassword(passHash: string) {
    this.passwordHash = passHash;
    this.passwordRecovery = null;
  }

  get isEmailConfirmed(): boolean {
    // если создан админом — emailConfirmation null, считаем подтверждённым
    return (
      this.emailConfirmation === null || this.emailConfirmation.isConfirmed
    );
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
