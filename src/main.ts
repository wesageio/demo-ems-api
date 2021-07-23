import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import bodyParser = require('body-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:  process.env.ENV === 'dev' ? ['log', 'debug', 'error', 'warn'] :
        ['error', 'warn', 'log'],
  });
  app.enableCors();
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  await app.listen(3001);
}
bootstrap();
