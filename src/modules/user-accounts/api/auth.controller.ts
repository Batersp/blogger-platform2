import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { AuthService } from '../application/auth.service';
import { type Response, type Request } from 'express';
import {
  ConfirmEmailInputDto,
  CreateNewPasswordInputDto,
  CreateUserInputDto,
  PasswordRecoveryInputDto,
  ResendConfirmationCodeInputDto,
} from './input-dto/users.input-dto';
import { UsersService } from '../application/user.service';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from './view-dto/users.view-dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../application/usecases/auth/refreshToken.usecase';
import { RefreshTokenGuard } from '../guards/refresh-token/refresh-token.guard';
import { ExtractRefreshTokenPayload } from '../guards/decorators/extract-refresh-token-payload.decorator';
import { RefreshTokenPayloadDto } from '../guards/dto/refreshToken-payload.dto';
import { LogoutCommand } from '../application/usecases/auth/logout.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private authQueryRepository: AuthQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.authService.login(
      user.id,
      req.ip!,
      req.headers['user-agent'],
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // недоступен из JS
      secure: true, // только HTTPS
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней в мс
    });
    return { accessToken };
  }

  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() body: ConfirmEmailInputDto): Promise<void> {
    return this.authService.confirmRegistration(body);
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationCode(
    @Body() body: ResendConfirmationCodeInputDto,
  ): Promise<void> {
    return this.authService.resendConfirmationCode(body);
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() body: PasswordRecoveryInputDto,
  ): Promise<void> {
    return this.authService.passwordRecovery(body);
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async createNewPassword(
    @Body() body: CreateNewPasswordInputDto,
  ): Promise<void> {
    return this.authService.createNewPassword(body);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @ExtractRefreshTokenPayload() payload: RefreshTokenPayloadDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new RefreshTokenCommand({
        userId: payload.userId,
        deviceId: payload.deviceId,
        iat: payload.iat,
        ip: req.ip!,
      }),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenGuard)
  async logout(
    @ExtractRefreshTokenPayload() payload: RefreshTokenPayloadDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.commandBus.execute(
      new LogoutCommand({
        deviceId: payload.deviceId,
        userId: payload.userId,
        iat: payload.iat,
      }),
    );

    res.clearCookie('refreshToken');
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }
}
