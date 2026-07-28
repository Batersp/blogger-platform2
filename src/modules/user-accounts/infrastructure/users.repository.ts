import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PasswordRecoveryInfo } from '../domain/passwordRecoveryInfo.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(PasswordRecoveryInfo)
    private passwordRecoveryInfoRepo: Repository<PasswordRecoveryInfo>,
  ) {}

  async findByLogin(login: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { login },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { id },
    });
  }

  async findByConfirmationCode(code: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: {
        emailConfirmation: {
          confirmationCode: code,
        },
        deletedAt: IsNull(),
      },
      relations: { emailConfirmation: true },
    });
  }

  async findByRecoveryCode(code: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: {
        passwordRecovery: {
          recoveryCode: code,
        },
        deletedAt: IsNull(),
      },
      relations: { passwordRecovery: true },
    });
  }

  async save(user: User): Promise<void> {
    if (user.passwordRecovery === null) {
      await this.passwordRecoveryInfoRepo.delete({ userId: user.id });
    }
    await this.usersRepo.save(user);
  }

  async findOrNotFoundFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.usersRepo.softDelete(userId);
  }
}
