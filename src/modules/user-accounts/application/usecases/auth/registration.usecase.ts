import {
  Command,
  CommandBus,
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { CreateUserCommand } from '../users/create-user.usecase';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { EmailService } from '../../../../notifications/email.service';

interface RegistrationCommandProps {
  login: string;
  password: string;
  email: string;
}

export class RegistrationCommand extends Command<void> {
  login: string;
  password: string;
  email: string;
  constructor(public init: RegistrationCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<
  RegistrationCommand,
  void
> {
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({
    login,
    password,
    email,
  }: RegistrationCommand): Promise<void> {
    const createdUserId = await this.commandBus.execute(
      new CreateUserCommand({ login, password, email }),
    );
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
