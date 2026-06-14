import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../../infrastructure/securityDevices.repository';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

interface DeleteSessionCommandProps {
  userId: string;
  currentDeviceId: string; // из payload — для проверки текущей сессии
  iat: number; // из payload
  targetDeviceId: string; // из :deviceId — что удаляем
}

export class DeleteSessionCommand extends Command<void> {
  userId: string;
  currentDeviceId: string;
  iat: number;
  targetDeviceId: string;
  constructor(public init: DeleteSessionCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase implements ICommandHandler<
  DeleteSessionCommand,
  void
> {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute({
    userId,
    currentDeviceId,
    iat,
    targetDeviceId,
  }: DeleteSessionCommand): Promise<void> {
    // 1. Проверяем, что ТЕКУЩАЯ сессия валидна (не устаревший токен)
    const currentSession =
      await this.securityDevicesRepository.findCurrentSession(
        currentDeviceId,
        iat,
      );

    if (!currentSession || currentSession.userId !== userId) {
      throw new UnauthorizedException('Текущая Сессия не найдена');
    }

    // 2. Находим ЦЕЛЕВУЮ сессию по deviceId из URL
    const targetSession =
      await this.securityDevicesRepository.findSessionByDeviceId(
        targetDeviceId,
      );

    if (!targetSession) throw new NotFoundException('Сессия не найдена');

    if (targetSession.userId !== userId) throw new ForbiddenException();

    // 3. Удаляем целевую
    await this.securityDevicesRepository.deleteSession(targetDeviceId);
  }
}
