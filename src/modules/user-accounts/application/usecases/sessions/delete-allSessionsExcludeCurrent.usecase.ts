import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../../infrastructure/securityDevices.repository';
import { UnauthorizedException } from '@nestjs/common';

interface DeleteAllSessionsExcludeCurrentCommandProps {
  userId: string;
  deviceId: string;
  iat: number;
}

export class DeleteAllSessionsExcludeCurrentCommand extends Command<void> {
  userId: string;
  deviceId: string;
  iat: number;
  constructor(public init: DeleteAllSessionsExcludeCurrentCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(DeleteAllSessionsExcludeCurrentCommand)
export class DeleteAllSessionsExcludeCurrentUseCase implements ICommandHandler<
  DeleteAllSessionsExcludeCurrentCommand,
  void
> {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute({
    userId,
    deviceId,
    iat,
  }: DeleteAllSessionsExcludeCurrentCommand): Promise<void> {
    const session = await this.securityDevicesRepository.findCurrentSession(
      deviceId,
      iat,
    );

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Сессия не найдена');
    }
    await this.securityDevicesRepository.deleteAllSessionsExcludeCurrent(
      userId,
      deviceId,
    );
  }
}
