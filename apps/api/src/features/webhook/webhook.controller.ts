import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../common/database/prisma.service';
import { RazorpayService } from '../razorpay/razorpay.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly razorpay: RazorpayService,
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Public()
  @Post('razorpay')
  @HttpCode(200)
  async handleRazorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody =
      typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(req.body);

    if (!this.razorpay.verifyWebhookSignature(rawBody, signature ?? '')) {
      throw new UnauthorizedException('INVALID_WEBHOOK_SIGNATURE');
    }

    const event = req.body as {
      event: string;
      payload: Record<string, unknown>;
      id?: string;
    };

    const eventId = event.id ?? `${event.event}_${Date.now()}`;

    const existing = await this.prisma.webhookEvent.findUnique({
      where: { eventId },
    });
    if (existing) {
      return { received: true, duplicate: true };
    }

    await this.prisma.webhookEvent.create({
      data: {
        provider: 'razorpay',
        eventId,
        eventType: event.event,
        payload: event as object,
      },
    });

    await this.subscriptionService.handleWebhookEvent(event);

    return { received: true };
  }
}
