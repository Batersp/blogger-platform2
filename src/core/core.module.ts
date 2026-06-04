import { Global, Module } from '@nestjs/common';
import { BcryptService } from './services/bcrypt.service';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [BcryptService],
  exports: [BcryptService, CqrsModule],
})
export class CoreModule {}
