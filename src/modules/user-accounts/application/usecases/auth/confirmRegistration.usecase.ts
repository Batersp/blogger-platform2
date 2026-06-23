import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { UsersRepository } from '../../../infrastructure/users.repository';

interface ConfirmRegistrationCommandProps {
  code: string;
}

export class ConfirmRegistrationCommand extends Command<void> {
  code: string;
  constructor(public init: ConfirmRegistrationCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase implements ICommandHandler<
  ConfirmRegistrationCommand,
  void
> {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ code }: ConfirmRegistrationCommand): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode(code);

    if (!user) {
      throw DomainException.badRequest([
        { message: 'Code is invalid', field: 'code' },
      ]);
    }

    if (
      user.emailConfirmation &&
      user.emailConfirmation.expirationDate < new Date()
    ) {
      throw DomainException.badRequest([
        { message: 'Code has expired', field: 'code' },
      ]);
    }
    if (user.emailConfirmation && user.emailConfirmation.isConfirmed) {
      throw DomainException.badRequest([
        { message: 'Email already confirmed', field: 'code' },
      ]);
    }

    user.confirmCode();
    await this.usersRepository.save(user);
  }
}
