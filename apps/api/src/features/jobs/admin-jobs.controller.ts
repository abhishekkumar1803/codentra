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
import { Role, type User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateJobDto,
  ListJobsQueryDto,
  UpdateJobDto,
} from './dto/job.dto';
import { JobsService } from './jobs.service';

@Controller('admin/jobs')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  list(@Query() query: ListJobsQueryDto) {
    return this.jobsService.adminList(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: User, @Body() dto: CreateJobDto) {
    return this.jobsService.adminCreate(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.adminUpdate(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.jobsService.adminDelete(id);
  }
}
