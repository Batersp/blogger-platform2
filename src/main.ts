import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get<CoreConfig>(CoreConfig);
  appSetup(app);
  const PORT = appConfig.port;
  await app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('ENV: ', appConfig.env);
  });
}
bootstrap();
