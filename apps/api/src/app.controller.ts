import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import type { HealthCheck } from '@codentra/types';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  getHealth(): HealthCheck {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }
}
