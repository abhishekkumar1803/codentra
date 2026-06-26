import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerAppModule } from './worker.module';

async function bootstrap() {
  const logger = new Logger('SubmissionWorker');
  process.env.ENABLE_SUBMISSION_WORKER = 'true';

  const app = await NestFactory.createApplicationContext(WorkerAppModule, {
    logger: ['error', 'warn', 'log'],
  });

  logger.log('Submission judge worker running (BullMQ + Judge0)');

  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

void bootstrap();
