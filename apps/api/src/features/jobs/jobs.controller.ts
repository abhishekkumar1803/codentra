import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RequireSubscription } from '../../common/decorators/require-subscription.decorator';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ListJobsQueryDto } from './dto/job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UseGuards(SubscriptionGuard)
@RequireSubscription()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  listJobs(@Query() query: ListJobsQueryDto) {
    return this.jobsService.listJobs(query);
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }
}
