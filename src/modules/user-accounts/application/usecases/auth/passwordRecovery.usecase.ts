import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { EmailService } from '../../../../notifications/email.service';

interface PasswordRecoveryCommandProps {
  email: string;
}

export class PasswordRecoveryCommand extends Command<void> {
  email: string;
  constructor(public init: PasswordRecoveryCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<
  PasswordRecoveryCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return;
    const code = randomUUID();
    const expirationDate = add(new Date(), { hours: 1 });

    user.savePasswordRecoveryCode(code, expirationDate);
    await this.usersRepository.save(user);
    await this.emailService.sendPasswordRecovery(email, code);
  }
}
