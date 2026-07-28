import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { BcryptService } from '../../../../../core/services/bcrypt.service';
import {
  loginConstraints,
  passwordConstraints,
  User,
} from '../../../domain/user.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

interface CreateUserCommandProps {
  login: string;
  password: string;
  email: string;
}

export class CreateUserCommand extends Command<string> {
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

  constructor(public init: CreateUserCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  string
> {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { login, email, password } = command;
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
    const user = User.createInstance({
      login,
      email,
      passwordHash,
    });
    await this.usersRepository.save(user);
    return user.id;
  }
}
