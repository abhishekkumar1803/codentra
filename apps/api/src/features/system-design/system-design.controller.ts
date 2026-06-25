import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { RequireSubscription } from '../../common/decorators/require-subscription.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { SubmitSystemDesignDto } from './dto/system-design.dto';
import { SystemDesignService } from './system-design.service';

@Controller('contests')
@UseGuards(SubscriptionGuard)
@RequireSubscription()
export class SystemDesignController {
  constructor(private readonly systemDesignService: SystemDesignService) {}

  @Get(':slug/system-design')
  getChallenge(@CurrentUser() user: User, @Param('slug') slug: string) {
    return this.systemDesignService.getChallenge(slug, user.id);
  }

  @Post(':id/system-design/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SubmitSystemDesignDto,
  ) {
    return this.systemDesignService.submit(id, user, dto);
  }
}
