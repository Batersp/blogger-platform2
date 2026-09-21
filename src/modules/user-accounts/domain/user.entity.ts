import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { Column, Entity, OneToMany, OneToOne, UpdateDateColumn } from 'typeorm';
import { BaseDBEntity } from '../../../core/entities/base.entity';
import { EmailConfirmationInfo } from './emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from './passwordRecoveryInfo.entity';
import { SecurityDevice } from './securityDevice.entity';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

@Entity({ name: 'users' })
export class User extends BaseDBEntity {
  @UpdateDateColumn()
  updatedAt: Date | null;

  @Column({ type: 'varchar', length: 100 })
  login: string;
  @Column({ type: 'varchar', length: 100 })
  email: string;
  @Column({ type: 'varchar', length: 100 })
  passwordHash: string;

  @OneToOne(
    () => EmailConfirmationInfo,
    (emailConfirmationInfo) => emailConfirmationInfo.user,
    {
      cascade: true,
      eager: true, // чтобы инфа всегда подтягиваласьь без явного указания relations в репозитории
    },
  )
  emailConfirmation: EmailConfirmationInfo | null;

  @OneToOne(
    () => PasswordRecoveryInfo,
    (passwordRecoveryInfo) => passwordRecoveryInfo.user,
    {
      cascade: true,
      eager: true,
    },
  )
  passwordRecovery: PasswordRecoveryInfo | null;

  @OneToMany(() => SecurityDevice, (device) => device.user)
  securityDevices: SecurityDevice[];

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

  setConfirmationCode(confirmationCode: EmailConfirmationInfo) {
    this.emailConfirmation = confirmationCode;
  }

  confirmCode() {
    if (this.emailConfirmation) {
      this.emailConfirmation.confirm();
    }
  }

  setPasswordRecoveryCode(passwordRecoveryInfo: PasswordRecoveryInfo) {
    this.passwordRecovery = passwordRecoveryInfo;
  }

  updatePassword(passHash: string) {
    this.passwordHash = passHash;
    this.passwordRecovery = null;
  }
}
