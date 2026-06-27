import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import type {
  CreateJobDto,
  ListJobsQueryDto,
  UpdateJobDto,
} from './dto/job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async listJobs(query: ListJobsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      isActive: true,
      deletedAt: null,
      ...(query.jobType ? { jobType: query.jobType } : {}),
      ...(query.company
        ? { company: { contains: query.company, mode: 'insensitive' as const } }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                title: { contains: query.search, mode: 'insensitive' as const },
              },
              {
                company: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      items: jobs.map((j) => this.formatJob(j)),
      meta: { page, limit, total },
    };
  }

  async getJobById(id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, isActive: true, deletedAt: null },
    });

    if (!job) {
      throw new NotFoundException('JOB_NOT_FOUND');
    }

    return this.formatJob(job);
  }

  async adminList(query: ListJobsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      deletedAt: null,
      ...(query.jobType ? { jobType: query.jobType } : {}),
      ...(query.search
        ? {
            OR: [
              {
                title: { contains: query.search, mode: 'insensitive' as const },
              },
              {
                company: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      items: jobs.map((j) => this.formatJob(j)),
      meta: { page, limit, total },
    };
  }

  async adminCreate(dto: CreateJobDto, adminId: string) {
    const job = await this.prisma.job.create({
      data: {
        title: dto.title,
        company: dto.company,
        description: dto.description,
        location: dto.location,
        jobType: dto.jobType,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        applyUrl: dto.applyUrl,
        postedById: adminId,
      },
    });

    return this.formatJob(job);
  }

  async adminUpdate(id: string, dto: UpdateJobDto) {
    const existing = await this.prisma.job.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('JOB_NOT_FOUND');
    }

    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.company !== undefined ? { company: dto.company } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.jobType !== undefined ? { jobType: dto.jobType } : {}),
        ...(dto.salaryMin !== undefined ? { salaryMin: dto.salaryMin } : {}),
        ...(dto.salaryMax !== undefined ? { salaryMax: dto.salaryMax } : {}),
        ...(dto.applyUrl !== undefined ? { applyUrl: dto.applyUrl } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    return this.formatJob(job);
  }

  async adminDelete(id: string) {
    const existing = await this.prisma.job.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('JOB_NOT_FOUND');
    }

    await this.prisma.job.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Job deleted.' };
  }

  private formatJob(job: {
    id: string;
    title: string;
    company: string;
    description: string;
    location: string | null;
    jobType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    applyUrl: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      jobType: job.jobType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      applyUrl: job.applyUrl,
      isActive: job.isActive,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
