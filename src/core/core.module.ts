import { Global, Module } from '@nestjs/common';
import { BcryptService } from './services/bcrypt.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreConfig } from './core.config';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [BcryptService, CoreConfig],
  exports: [BcryptService, CqrsModule, CoreConfig],
})
export class CoreModule {}
