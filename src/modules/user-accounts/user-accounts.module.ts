import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersService } from './application/user.service';
import { UsersController } from './api/users.controller';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { DeleteUserUseCase } from './application/usecases/users/delete-user.usecase';
import { GetAllUsersQueryHandler } from './application/queries/users/get-users.query';
import { CreateUserUseCase } from './application/usecases/users/create-user.usecase';
import { SecurityDevicesController } from './api/securityDevices.controller';
import { SecurityDevicesRepository } from './infrastructure/securityDevices.repository';
import { SecurityDeviceService } from './application/securityDevice.service';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../core/core.config';
import { RefreshTokenUseCase } from './application/usecases/auth/refreshToken.usecase';
import { LogoutUseCase } from './application/usecases/auth/logout.usecase';
import { DeleteAllSessionsExcludeCurrentUseCase } from './application/usecases/sessions/delete-allSessionsExcludeCurrent.usecase';
import { DeleteSessionUseCase } from './application/usecases/sessions/delete-session.usecase';
import { GetActiveSessionsQueryHandler } from './application/queries/sessions/get-activeSessions.query';
import { SecurityDevicesQueryRepository } from './infrastructure/query/securityDevices.query-repository';
import { LoginUseCase } from './application/usecases/auth/login.usecase';
import { RegistrationUseCase } from './application/usecases/auth/registration.usecase';
import { ConfirmRegistrationUseCase } from './application/usecases/auth/confirmRegistration.usecase';
import { ResendConfirmationCodeUseCase } from './application/usecases/auth/resendConfirmationCode.usecase';
import { PasswordRecoveryUseCase } from './application/usecases/auth/passwordRecovery.usecase';
import { CreateNewPasswordUseCase } from './application/usecases/auth/createNewPassword.usecase';
import { MeQueryHandler } from './application/queries/auth/me.query';

const commandHandlers = [
  DeleteUserUseCase,
  CreateUserUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  DeleteAllSessionsExcludeCurrentUseCase,
  DeleteSessionUseCase,
  LoginUseCase,
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  ResendConfirmationCodeUseCase,
  PasswordRecoveryUseCase,
  CreateNewPasswordUseCase,
];
const queryHandlers = [
  GetAllUsersQueryHandler,
  GetActiveSessionsQueryHandler,
  MeQueryHandler,
];

@Module({
  imports: [JwtModule, NotificationsModule],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    UsersRepository,
    UsersQueryRepository,
    AuthQueryRepository,
    SecurityDevicesRepository,
    SecurityDevicesQueryRepository,
    UsersService,
    AuthService,
    SecurityDeviceService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (coreConfig: CoreConfig): JwtService => {
        return new JwtService({
          secret: coreConfig.accessTokenSecret,
          signOptions: { expiresIn: '10s' },
        });
      },
      inject: [CoreConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (coreConfig: CoreConfig): JwtService => {
        return new JwtService({
          secret: coreConfig.refreshTokenSecret,
          signOptions: { expiresIn: '20s' },
        });
      },
      inject: [CoreConfig],
    },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [UsersRepository],
})
export class UserAccountsModule {}
