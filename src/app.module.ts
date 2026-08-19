import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { CoreModule } from './core/core.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { ThrottlerModule } from '@nestjs/throttler';
import { configModule } from './dynamic-config-module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { options } from './db/options';

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRoot({
      ...options,
      autoLoadEntities: true,
    }),
    UserAccountsModule,
    BloggersPlatformModule,
    CoreModule,
    TestingModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000, // 10 секунд в миллисекундах
        limit: 50000, // максимум 5 запросов
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {}
