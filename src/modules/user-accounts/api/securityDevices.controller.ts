import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RefreshTokenGuard } from '../guards/refresh-token/refresh-token.guard';
import { ExtractRefreshTokenPayload } from '../guards/decorators/extract-refresh-token-payload.decorator';
import { RefreshTokenPayloadDto } from '../guards/dto/refreshToken-payload.dto';
import { DeleteAllSessionsExcludeCurrentCommand } from '../application/usecases/sessions/delete-allSessionsExcludeCurrent.usecase';
import { DeleteSessionCommand } from '../application/usecases/sessions/delete-session.usecase';
import { GetActiveSessionsQuery } from '../application/queries/sessions/get-activeSessions.query';
import { SessionsViewDto } from './view-dto/sessions.view-dto';

@Controller('security')
export class SecurityDevicesController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async getActiveSessions(
    @ExtractRefreshTokenPayload() payload: RefreshTokenPayloadDto,
  ): Promise<SessionsViewDto[]> {
    return this.queryBus.execute(new GetActiveSessionsQuery(payload.userId));
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenGuard)
  async deleteAllSessionsExcludeCurrent(
    @ExtractRefreshTokenPayload() payload: RefreshTokenPayloadDto,
  ) {
    return this.commandBus.execute(
      new DeleteAllSessionsExcludeCurrentCommand({
        userId: payload.userId,
        deviceId: payload.deviceId,
        iat: payload.iat,
      }),
    );
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenGuard)
  async deleteSession(
    @Param('deviceId') deviceId: string,
    @ExtractRefreshTokenPayload() payload: RefreshTokenPayloadDto,
  ) {
    return this.commandBus.execute(
      new DeleteSessionCommand({
        userId: payload.userId,
        currentDeviceId: payload.deviceId,
        iat: payload.iat,
        targetDeviceId: deviceId,
      }),
    );
  }
}
