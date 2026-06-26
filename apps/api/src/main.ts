import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3001);
  console.log(`[codentra-api] Bootstrapping on 0.0.0.0:${port}...`);
  console.log(
    `[codentra-api] Env: DATABASE_URL=${process.env.DATABASE_URL ? 'set' : 'MISSING'}, JWT_SECRET=${process.env.JWT_SECRET ? 'set' : 'MISSING'}`,
  );

  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.listen(port, '0.0.0.0');
  console.log(
    `[codentra-api] Listening on 0.0.0.0:${port} (health: /api/v1/health)`,
  );
}

void bootstrap().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
