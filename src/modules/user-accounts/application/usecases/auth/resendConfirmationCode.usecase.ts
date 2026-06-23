import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { EmailService } from '../../../../notifications/email.service';

interface ResendConfirmationCodeCommandProps {
  email: string;
}

export class ResendConfirmationCodeCommand extends Command<void> {
  email: string;
  constructor(public init: ResendConfirmationCodeCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase implements ICommandHandler<
  ResendConfirmationCodeCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ email }: ResendConfirmationCodeCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw DomainException.badRequest([
        {
          message: 'user with this email not found',
          field: 'email',
        },
      ]);
    }
    if (user.emailConfirmation?.isConfirmed) {
      throw DomainException.badRequest([
        {
          message: 'Email already confirmed',
          field: 'email',
        },
      ]);
    }

    const newCode = randomUUID();
    const newExpiration = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    user.updateConfirmationCode(newCode, newExpiration);
    await this.usersRepository.save(user);
    await this.emailService.sendConfirmationEmail(email, newCode);
  }
}
