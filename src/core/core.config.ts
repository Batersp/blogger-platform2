import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number;

  @IsNotEmpty({
    message:
      'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db',
  })
  mongoURI: string;

  @IsBoolean({
    message: 'Set boolean value like true or false',
  })
  includeTestingModule: boolean;

  @IsEnum(Environments, {
    message:
      'Ser correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET',
  })
  accessTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET',
  })
  refreshTokenSecret: string;

  constructor(private configService: ConfigService) {
    this.port = Number(this.configService.get('PORT'));

    this.mongoURI = String(this.configService.get('MONGODB_URI'));

    this.includeTestingModule = configValidationUtility.convertToBoolean(
      this.configService.get('INCLUDE_TESTING_MODULE')!,
    ) as boolean;

    this.env = this.configService.get('NODE_ENV') as Environments;

    this.accessTokenSecret = String(
      this.configService.get('ACCESS_TOKEN_SECRET'),
    );

    this.refreshTokenSecret = String(
      this.configService.get('REFRESH_TOKEN_SECRET'),
    );

    configValidationUtility.validateConfig(this);
  }
}
