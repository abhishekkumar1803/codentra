import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('me')
  getMySubscription(@CurrentUser() user: User) {
    return this.subscriptionService.getMySubscription(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSubscription(
    @CurrentUser() user: User,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.createSubscription(user.id, dto);
  }

  @Post('cancel')
  cancelSubscription(@CurrentUser() user: User) {
    return this.subscriptionService.cancelSubscription(user.id);
  }
}
