import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { RequireSubscription } from '../../common/decorators/require-subscription.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import {
  CreateReferralDto,
  ExpressInterestDto,
  ListReferralsQueryDto,
  UpdateReferralDto,
} from './dto/referral.dto';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
@UseGuards(SubscriptionGuard)
@RequireSubscription()
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get()
  listReferrals(
    @CurrentUser() user: User,
    @Query() query: ListReferralsQueryDto,
  ) {
    return this.referralsService.listReferrals(query, user.id);
  }

  @Get('me')
  listMyReferrals(
    @CurrentUser() user: User,
    @Query() query: ListReferralsQueryDto,
  ) {
    return this.referralsService.listMyReferrals(user.id, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createReferral(@CurrentUser() user: User, @Body() dto: CreateReferralDto) {
    return this.referralsService.createReferral(user, dto);
  }

  @Post(':id/express-interest')
  @HttpCode(HttpStatus.OK)
  expressInterest(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: ExpressInterestDto,
  ) {
    return this.referralsService.expressInterest(id, user, dto.message);
  }

  @Get(':id')
  getReferral(@CurrentUser() user: User, @Param('id') id: string) {
    return this.referralsService.getReferralById(id, user.id);
  }

  @Patch(':id')
  updateReferral(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateReferralDto,
  ) {
    return this.referralsService.updateReferral(id, user, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteReferral(@CurrentUser() user: User, @Param('id') id: string) {
    return this.referralsService.deleteReferral(id, user);
  }
}
