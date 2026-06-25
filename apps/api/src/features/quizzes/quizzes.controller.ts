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
import { SubmitQuizDto } from './dto/quiz.dto';
import { QuizzesService } from './quizzes.service';

@Controller('contests')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(':slug/quiz')
  @UseGuards(SubscriptionGuard)
  @RequireSubscription()
  getQuiz(@CurrentUser() user: User, @Param('slug') slug: string) {
    return this.quizzesService.getQuizBySlug(slug, user.id);
  }

  @Post(':id/quiz/submit')
  @UseGuards(SubscriptionGuard)
  @RequireSubscription()
  @HttpCode(HttpStatus.OK)
  submitQuiz(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizzesService.submitQuiz(id, user, dto);
  }

  @Get(':id/quiz/results')
  getResults(@CurrentUser() user: User, @Param('id') id: string) {
    return this.quizzesService.getResults(id, user.id);
  }
}
