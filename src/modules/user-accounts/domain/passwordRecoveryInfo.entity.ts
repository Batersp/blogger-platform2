import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordRecoveryInfo {
  @Column({ type: 'varchar' })
  recoveryCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @OneToOne(() => User, (user) => user.passwordRecovery)
  @JoinColumn({ name: 'userId' })
  user: User;

  @PrimaryColumn()
  userId: string;

  static createInstance(
    user: User,
    code: string,
    expirationDate: Date,
  ): PasswordRecoveryInfo {
    const info = new PasswordRecoveryInfo();
    info.user = user;
    info.userId = user.id;
    info.recoveryCode = code;
    info.expirationDate = expirationDate;
    return info;
  }
}
