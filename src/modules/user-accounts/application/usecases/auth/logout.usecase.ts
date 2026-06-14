import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../../infrastructure/securityDevices.repository';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

interface LogoutCommandProps {
  userId: string;
  deviceId: string;
  iat: number;
}

export class LogoutCommand extends Command<void> {
  userId: string;
  deviceId: string;
  iat: number;
  constructor(public init: LogoutCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute({ userId, deviceId, iat }: LogoutCommand): Promise<void> {
    const session = await this.securityDevicesRepository.findCurrentSession(
      deviceId,
      iat,
    );

    if (!session) throw new UnauthorizedException('Сессия не найдена');

    if (session.userId !== userId) throw new ForbiddenException();

    await this.securityDevicesRepository.deleteSession(deviceId);
  }
}
