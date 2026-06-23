import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevice } from '../../../domain/securityDevice.entity';
import { SecurityDevicesRepository } from '../../../infrastructure/securityDevices.repository';

interface LoginCommandProps {
  userId: string;
  ip: string;
  deviceName: string;
}

export class LoginCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  userId: string;
  ip: string;
  deviceName: string;
  constructor(public init: LoginCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<
  LoginCommand,
  { accessToken: string; refreshToken: string }
> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({
    userId,
    ip,
    deviceName,
  }: LoginCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.accessTokenContext.sign({ id: userId });

    const deviceId = crypto.randomUUID();
    const refreshToken = this.refreshTokenContext.sign({ userId, deviceId });

    const { iat, exp } = this.refreshTokenContext.decode(refreshToken);

    const securityDevice = SecurityDevice.createInstance({
      userId,
      deviceId,
      iat: iat as number,
      exp: exp as number,
      deviceName,
      ip,
    });

    await this.securityDevicesRepository.create(securityDevice);

    return {
      accessToken,
      refreshToken,
    };
  }
}
