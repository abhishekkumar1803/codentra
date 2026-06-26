import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { User } from '@prisma/client';
import { RequireSubscription } from '../../common/decorators/require-subscription.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import {
  ListSubmissionsQueryDto,
  RunCodeDto,
  SubmitCodeDto,
} from './dto/problem.dto';
import { ProblemsService } from './problems.service';

@Controller('contests/:contestSlug/problems')
@UseGuards(SubscriptionGuard)
@RequireSubscription()
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get()
  listProblems(@Param('contestSlug') contestSlug: string) {
    return this.problemsService.listProblems(contestSlug);
  }

  @Get(':problemSlug/submissions')
  listSubmissions(
    @Param('contestSlug') contestSlug: string,
    @Param('problemSlug') problemSlug: string,
    @CurrentUser() user: User,
    @Query() query: ListSubmissionsQueryDto,
  ) {
    return this.problemsService.listSubmissions(
      contestSlug,
      problemSlug,
      user.id,
      query,
    );
  }

  @Get(':problemSlug/submissions/:submissionId')
  getSubmission(
    @Param('contestSlug') contestSlug: string,
    @Param('problemSlug') problemSlug: string,
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: User,
  ) {
    return this.problemsService.getSubmission(
      contestSlug,
      problemSlug,
      submissionId,
      user.id,
    );
  }

  @Get(':problemSlug')
  getProblem(
    @Param('contestSlug') contestSlug: string,
    @Param('problemSlug') problemSlug: string,
    @CurrentUser() user: User,
  ) {
    return this.problemsService.getProblem(contestSlug, problemSlug, user.id);
  }

  @Post(':problemSlug/run')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  runCode(
    @Param('contestSlug') contestSlug: string,
    @Param('problemSlug') problemSlug: string,
    @CurrentUser() user: User,
    @Body() dto: RunCodeDto,
  ) {
    return this.problemsService.runCode(
      contestSlug,
      problemSlug,
      user.id,
      dto,
    );
  }

  @Post(':problemSlug/submit')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  submitCode(
    @Param('contestSlug') contestSlug: string,
    @Param('problemSlug') problemSlug: string,
    @CurrentUser() user: User,
    @Body() dto: SubmitCodeDto,
  ) {
    return this.problemsService.submitCode(
      contestSlug,
      problemSlug,
      user,
      dto,
    );
  }
}
