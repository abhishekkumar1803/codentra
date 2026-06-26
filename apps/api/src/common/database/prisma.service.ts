import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  onModuleInit() {
    // Connect in background so Railway healthcheck can pass while DB warms up.
    void this.$connect().catch((error) => {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      console.error(
        `[PrismaService] Initial DB connect failed (will retry on query). ` +
          `Check DATABASE_URL — remove channel_binding=require on Railway. Error: ${message}`,
      );
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
