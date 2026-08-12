import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json } from 'express';
import type { IncomingMessage } from 'http';
import { AppModule } from './app.module';
import { correlationIdMiddleware } from './common/middleware/correlation-id.middleware';

interface RequestWithRawBody extends IncomingMessage {
  rawBody?: Buffer;
}

const REQUIRED_ENV_VARS = ['GATEWAY_BASE_URL', 'JWT_SECRET', 'CRYPTO_SECRET'];

function assertRequiredEnvVars(configService: ConfigService) {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !configService.get<string>(key),
  );
  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`,
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const configService = app.get(ConfigService);
  assertRequiredEnvVars(configService);

  app.enableCors();
  app.use(correlationIdMiddleware);
  app.use(
    json({
      verify: (req: RequestWithRawBody, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BaaS VBA Systems API')
    .setDescription('API do desafio BaaS VBA Systems')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = configService.get<number>('BACK_PORT', 3000);

  await app.listen(port);
}

bootstrap();
