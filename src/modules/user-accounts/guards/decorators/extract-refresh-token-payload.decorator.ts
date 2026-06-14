import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenPayloadDto } from '../dto/refreshToken-payload.dto';

export const ExtractRefreshTokenPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RefreshTokenPayloadDto | null => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    return req.refreshTokenPayload ?? null; // { userId, deviceId, iat, exp }
  },
);
