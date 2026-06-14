import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CoreConfig } from '../../../../core/core.config';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private coreConfig: CoreConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      // прикрепляем payload к запросу, чтобы достать в контроллере
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      req['refreshTokenPayload'] = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.coreConfig.refreshTokenSecret,
        },
      );
      return true;
    } catch {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }
}
