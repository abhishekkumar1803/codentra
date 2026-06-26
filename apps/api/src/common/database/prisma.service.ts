import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      console.error(
        `[PrismaService] Failed to connect. Check DATABASE_URL (remove channel_binding=require for Railway). Error: ${message}`,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
