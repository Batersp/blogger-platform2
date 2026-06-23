import { CreateUserDomainDto } from './dto/create-user.domain.dto';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export class EmailConfirmationInfo {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export class PasswordRecoveryInfo {
  recoveryCode: string;
  expirationDate: Date;
}

export class User {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  deletedAt: Date | null;
  emailConfirmation: EmailConfirmationInfo | null;
  passwordRecovery: PasswordRecoveryInfo | null;
  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateUserDomainDto): User {
    const user = new User();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.deletedAt = null;
    user.emailConfirmation = null;
    user.passwordRecovery = null;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return user;
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
      expirationDate,
    };
  }

  updatePassword(passHash: string) {
    this.passwordHash = passHash;
    this.passwordRecovery = null;
  }

  get isEmailConfirmed(): boolean {
    return (
      this.emailConfirmation === null || this.emailConfirmation.isConfirmed
    );
  }
}
