import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDoc } from './utils/documentation/app-doc';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ValidationFactory } from './utils/errors/errors-validation';
import { ResponseInterceptor } from './utils/interceptors/response.interceptor';
import { AppErrorFilter } from './utils/errors/errors.filter';
import { Transport } from '@nestjs/microservices';
import { niceEnv } from './utils/functions/env';
import { RabbitQueue } from './utils/types/rabbit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  new AppDoc(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: ValidationFactory,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'exposeAll',
      enableImplicitConversion: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AppErrorFilter());

  app.enableShutdownHooks();

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, api-key',
    credentials: true,
  });

  const porta = process.env.PORT || 3003;
  await app.listen(porta);
}
bootstrap();
