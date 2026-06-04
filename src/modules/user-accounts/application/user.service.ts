import { Injectable } from '@nestjs/common';
import { User, type UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from '../../../core/services/bcrypt.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { EmailService } from '../../notifications/email.service';
import { DomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
    private emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const { login, email, password } = dto;
    const userWithTheSameLogin = await this.usersRepository.findByLogin(login);
    if (userWithTheSameLogin) {
      throw DomainException.badRequest([
        { message: 'User with this login already exists', field: 'login' },
      ]);
    }
    const userWithTheSameEmail = await this.usersRepository.findByEmail(email);
    if (userWithTheSameEmail) {
      throw DomainException.badRequest([
        { message: 'User with this email already exists', field: 'email' },
      ]);
    }
    const passwordHash = await this.bcryptService.createHash(password);
    const user = this.UserModel.createInstance({
      login,
      email,
      passwordHash,
    });

    await this.usersRepository.save(user);
    return user._id.toString();
  }

  async registerUser(dto: CreateUserDto) {
    const createdUserId = await this.createUser(dto);
    const confirmCode = randomUUID();
    const user = await this.usersRepository.findOrNotFoundFail(createdUserId);
    user.setConfirmationCode(
      confirmCode,
      add(new Date(), {
        hours: 1,
        minutes: 30,
      }),
    );
    await this.usersRepository.save(user);
    await this.emailService.sendConfirmationEmail(user.email, confirmCode);
  }
}
