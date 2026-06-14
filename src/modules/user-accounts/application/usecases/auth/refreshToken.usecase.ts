import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../../infrastructure/securityDevices.repository';
import { JwtService } from '@nestjs/jwt';
import { Inject, UnauthorizedException } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../constants/auth-tokens.inject-constants';

interface RefreshTokenCommandProps {
  userId: string;
  deviceId: string;
  iat: number;
  ip: string;
}

export class RefreshTokenCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  userId: string;
  deviceId: string;
  iat: number;
  ip: string;
  constructor(public init: RefreshTokenCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<
  RefreshTokenCommand,
  { accessToken: string; refreshToken: string }
> {
  constructor(
    private securityDevicesRepository: SecurityDevicesRepository,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute({ userId, deviceId, iat, ip }: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const session = await this.securityDevicesRepository.findCurrentSession(
      deviceId,
      iat,
    );

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Сессия не найдена');
    }

    if (session.iat !== iat) {
      // токен валиден по подписи, но это "старая" версия — кто-то уже обновил после него
      throw new UnauthorizedException('Refresh token устарел');
    }

    const accessToken = this.accessTokenContext.sign({ id: userId });
    const newRefreshToken = this.refreshTokenContext.sign({ userId, deviceId });

    const { iat: newIat, exp: newExp } =
      this.refreshTokenContext.decode(newRefreshToken);

    session.update({
      iat: newIat,
      exp: newExp,
      ip,
    });

    await this.securityDevicesRepository.save(session);
    return { accessToken, refreshToken: newRefreshToken };
  }
}
