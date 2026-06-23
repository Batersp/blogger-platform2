import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { BcryptService } from '../../../../../core/services/bcrypt.service';

interface CreateNewPasswordCommandProps {
  newPassword: string;
  recoveryCode: string;
}

export class CreateNewPasswordCommand extends Command<void> {
  newPassword: string;
  recoveryCode: string;
  constructor(public init: CreateNewPasswordCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(CreateNewPasswordCommand)
export class CreateNewPasswordUseCase implements ICommandHandler<
  CreateNewPasswordCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute({
    newPassword,
    recoveryCode,
  }: CreateNewPasswordCommand): Promise<void> {
    const user = await this.usersRepository.findByRecoveryCode(recoveryCode);
    if (!user) throw new BadRequestException();
    if (!user.passwordRecovery) throw new BadRequestException();
    if (user.passwordRecovery.expirationDate < new Date())
      throw new BadRequestException();

    const passHash = await this.bcryptService.createHash(newPassword);
    user.updatePassword(passHash);
    await this.usersRepository.save(user);
  }
}
