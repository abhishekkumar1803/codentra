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
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
} from './dto/quiz.dto';
import { QuizzesService } from './quizzes.service';

@Controller('admin/contests/:contestId/quiz/questions')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminQuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  list(@Param('contestId') contestId: string) {
    return this.quizzesService.adminListQuestions(contestId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('contestId') contestId: string,
    @Body() dto: CreateQuizQuestionDto,
  ) {
    return this.quizzesService.adminCreateQuestion(contestId, dto);
  }

  @Patch(':questionId')
  update(
    @Param('contestId') contestId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuizQuestionDto,
  ) {
    return this.quizzesService.adminUpdateQuestion(contestId, questionId, dto);
  }

  @Delete(':questionId')
  @HttpCode(HttpStatus.OK)
  delete(
    @Param('contestId') contestId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.quizzesService.adminDeleteQuestion(contestId, questionId);
  }
}
