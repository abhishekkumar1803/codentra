import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { RequireSubscription } from '../../common/decorators/require-subscription.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ContestsService } from './contests.service';
import { ListContestsQueryDto } from './dto/contest.dto';

@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Get()
  listContests(
    @CurrentUser() user: User,
    @Query() query: ListContestsQueryDto,
  ) {
    return this.contestsService.listContests(query, user.id);
  }

  @Get(':id/participants')
  getParticipants(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contestsService.getParticipants(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post(':id/join')
  @UseGuards(SubscriptionGuard)
  @RequireSubscription()
  @HttpCode(HttpStatus.CREATED)
  joinContest(@CurrentUser() user: User, @Param('id') id: string) {
    return this.contestsService.joinContest(id, user);
  }

  @Get(':slug')
  getContest(@CurrentUser() user: User, @Param('slug') slug: string) {
    return this.contestsService.getContestBySlug(slug, user.id);
  }
}
