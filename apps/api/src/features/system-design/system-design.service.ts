import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContestStatus,
  ContestType,
  ParticipantStatus,
  type User,
} from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import type { SubmitSystemDesignDto } from './dto/system-design.dto';

@Injectable()
export class SystemDesignService {
  constructor(private readonly prisma: PrismaService) {}

  async getChallenge(slug: string, userId: string) {
    const contest = await this.findContestBySlug(slug);
    await this.requireParticipant(contest.id, userId);

    const submission = await this.prisma.systemDesignSubmission.findUnique({
      where: { contestId_userId: { contestId: contest.id, userId } },
    });

    return {
      contestId: contest.id,
      title: contest.title,
      slug: contest.slug,
      description: contest.description,
      status: contest.status,
      endTime: contest.endTime,
      hasSubmitted: !!submission,
      submission: submission
        ? {
            solution: submission.solution,
            diagramUrl: submission.diagramUrl,
            submittedAt: submission.submittedAt,
          }
        : null,
    };
  }

  async submit(contestId: string, user: User, dto: SubmitSystemDesignDto) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        deletedAt: null,
        type: ContestType.SYSTEM_DESIGN,
      },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    if (contest.status !== ContestStatus.LIVE) {
      throw new BusinessException(
        'CONTEST_NOT_AVAILABLE',
        'Submissions only accepted while contest is live',
      );
    }

    const participant = await this.requireParticipant(contestId, user.id);

    const existing = await this.prisma.systemDesignSubmission.findUnique({
      where: { contestId_userId: { contestId, userId: user.id } },
    });

    if (existing) {
      throw new ConflictException('ALREADY_SUBMITTED');
    }

    const submission = await this.prisma.$transaction(async (tx) => {
      const created = await tx.systemDesignSubmission.create({
        data: {
          contestId,
          userId: user.id,
          solution: dto.solution,
          diagramUrl: dto.diagramUrl,
        },
      });

      await tx.contestParticipant.update({
        where: { id: participant.id },
        data: {
          status: ParticipantStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });

      return created;
    });

    return {
      id: submission.id,
      contestId: submission.contestId,
      solution: submission.solution,
      diagramUrl: submission.diagramUrl,
      submittedAt: submission.submittedAt,
    };
  }

  private async findContestBySlug(slug: string) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        slug,
        deletedAt: null,
        type: ContestType.SYSTEM_DESIGN,
        status: {
          in: [
            ContestStatus.SCHEDULED,
            ContestStatus.LIVE,
            ContestStatus.ENDED,
          ],
        },
      },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    return contest;
  }

  private async requireParticipant(contestId: string, userId: string) {
    const participant = await this.prisma.contestParticipant.findUnique({
      where: { contestId_userId: { contestId, userId } },
    });

    if (!participant) {
      throw new BusinessException(
        'NOT_REGISTERED',
        'You must register for this contest first',
        403,
      );
    }

    return participant;
  }
}
