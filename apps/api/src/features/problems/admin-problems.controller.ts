import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateProblemDto,
  CreateTestCaseDto,
} from './dto/problem.dto';
import { ProblemsService } from './problems.service';

@Controller('admin/contests/:contestId/problems')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get()
  listProblems(@Param('contestId') contestId: string) {
    return this.problemsService.adminListProblems(contestId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProblem(
    @Param('contestId') contestId: string,
    @Body() dto: CreateProblemDto,
  ) {
    return this.problemsService.adminCreateProblem(contestId, dto);
  }

  @Delete(':problemId')
  @HttpCode(HttpStatus.OK)
  deleteProblem(@Param('problemId') problemId: string) {
    return this.problemsService.adminDeleteProblem(problemId);
  }

  @Post(':problemId/test-cases')
  @HttpCode(HttpStatus.CREATED)
  addTestCase(
    @Param('problemId') problemId: string,
    @Body() dto: CreateTestCaseDto,
  ) {
    return this.problemsService.adminAddTestCase(problemId, dto);
  }

  @Delete(':problemId/test-cases/:testCaseId')
  @HttpCode(HttpStatus.OK)
  deleteTestCase(@Param('testCaseId') testCaseId: string) {
    return this.problemsService.adminDeleteTestCase(testCaseId);
  }
}
