import { Controller, Get, Query } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListLeaderboardQueryDto } from './dto/leaderboard.dto';
import { LeaderboardsService } from './leaderboards.service';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get()
  getLeaderboard(@Query() query: ListLeaderboardQueryDto) {
    return this.leaderboardsService.getLeaderboard(query);
  }

  @Get('me')
  getMyRankings(@CurrentUser() user: User) {
    return this.leaderboardsService.getMyRankings(user.id);
  }
}
