import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmailConfirmationInfo {
  @Column({ type: 'varchar' })
  confirmationCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'boolean' })
  isConfirmed: boolean;

  @OneToOne(() => User, (user) => user.emailConfirmation)
  @JoinColumn({ name: 'userId' })
  user: User;

  @PrimaryColumn()
  userId: string;

  static createInstance(
    user: User,
    code: string,
    expirationDate: Date,
  ): EmailConfirmationInfo {
    const info = new EmailConfirmationInfo();
    info.user = user;
    info.userId = user.id;
    info.confirmationCode = code;
    info.expirationDate = expirationDate;
    info.isConfirmed = false;
    return info;
  }

  confirm() {
    this.isConfirmed = true;
  }
}
