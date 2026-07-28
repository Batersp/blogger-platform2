import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { SecurityDevicesRepository } from '../../../infrastructure/securityDevices.repository';

export class DeleteUserCommand extends Command<void> {
  constructor(public userId: string) {
    super();
  }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({ userId }: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    if (user.deletedAt != null) {
      throw new Error('Entity already deleted');
    }

    await this.usersRepository.deleteUser(user.id);

    await this.securityDevicesRepository.deleteAllByUserId(userId);
  }
}
