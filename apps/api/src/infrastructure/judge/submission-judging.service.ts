import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ContestStatus,
  ContestType,
  RatingType,
  SubmissionVerdict,
} from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { ratingDeltaForSolve } from '../../common/utils/rating.util';
import {
  evaluateTestCasesAsync,
  toTestRunResult,
} from '../../features/problems/utils/verdict.util';
import { JudgeService } from './judge.service';

@Injectable()
export class SubmissionJudgingService {
  private readonly logger = new Logger(SubmissionJudgingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly judge: JudgeService,
  ) {}

  async processSubmission(submissionId: string): Promise<void> {
    const submission = await this.prisma.codeSubmission.findUnique({
      where: { id: submissionId },
      include: {
        problem: true,
        contest: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('SUBMISSION_NOT_FOUND');
    }

    if (submission.verdict !== SubmissionVerdict.PENDING) {
      this.logger.debug(`Submission ${submissionId} already judged`);
      return;
    }

    const testCases = await this.prisma.problemTestCase.findMany({
      where: { problemId: submission.problemId },
      orderBy: { orderIndex: 'asc' },
    });

    if (testCases.length === 0) {
      await this.prisma.codeSubmission.update({
        where: { id: submissionId },
        data: {
          verdict: SubmissionVerdict.RUNTIME_ERROR,
          verdictDetails: { message: 'No test cases configured.' },
        },
      });
      return;
    }

    try {
      const evaluation = await evaluateTestCasesAsync(testCases, async (tc) => {
        const result = await this.judge.runTestCase({
          sourceCode: submission.sourceCode,
          language: submission.language,
          input: tc.input,
          expectedOutput: tc.output,
          timeLimitMs: submission.problem.timeLimitMs,
          memoryMb: submission.problem.memoryMb,
        });
        return toTestRunResult(result);
      });

      const registration = await this.prisma.contestParticipant.findUnique({
        where: {
          contestId_userId: {
            contestId: submission.contestId,
            userId: submission.userId,
          },
        },
      });

      const existingAccepted = await this.prisma.codeSubmission.findFirst({
        where: {
          problemId: submission.problemId,
          userId: submission.userId,
          verdict: SubmissionVerdict.ACCEPTED,
          id: { not: submissionId },
        },
      });

      const countsForScore =
        submission.contest.status === ContestStatus.LIVE &&
        !registration?.isVirtual;

      const score =
        countsForScore &&
        evaluation.verdict === SubmissionVerdict.ACCEPTED &&
        !existingAccepted
          ? submission.problem.points
          : 0;

      await this.prisma.codeSubmission.update({
        where: { id: submissionId },
        data: {
          verdict: evaluation.verdict,
          runtimeMs: evaluation.runtimeMs,
          score,
          verdictDetails: evaluation.details ?? undefined,
        },
      });

      if (score > 0) {
        await this.prisma.contestParticipant.update({
          where: {
            contestId_userId: {
              contestId: submission.contestId,
              userId: submission.userId,
            },
          },
          data: { score: { increment: score } },
        });

        await this.applyRatingGain(
          submission.userId,
          submission.contest.type,
          submission.problem.difficulty,
          submission.contestId,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed judging submission ${submissionId}`,
        error instanceof Error ? error.stack : error,
      );

      await this.prisma.codeSubmission.update({
        where: { id: submissionId },
        data: {
          verdict: SubmissionVerdict.RUNTIME_ERROR,
          verdictDetails: {
            message: 'Internal judge error. Please try again.',
          },
        },
      });
    }
  }

  private async applyRatingGain(
    userId: string,
    contestType: ContestType,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    contestId: string,
  ) {
    const ratingType =
      contestType === ContestType.COMPETITIVE_PROGRAMMING
        ? RatingType.CP
        : RatingType.DSA;

    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    const current =
      ratingType === RatingType.DSA
        ? profile?.dsaRating ?? 1200
        : profile?.cpRating ?? 1200;

    const delta = ratingDeltaForSolve(
      contestType === ContestType.COMPETITIVE_PROGRAMMING
        ? 'COMPETITIVE_PROGRAMMING'
        : 'DSA',
      difficulty,
    );
    const next = current + delta;

    await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        dsaRating: ratingType === RatingType.DSA ? next : 1200,
        cpRating: ratingType === RatingType.CP ? next : 1200,
      },
      update:
        ratingType === RatingType.DSA
          ? { dsaRating: next }
          : { cpRating: next },
    });

    await this.prisma.ratingHistory.create({
      data: {
        userId,
        type: ratingType,
        rating: next,
        delta,
        contestId,
        reason: 'Problem solved',
      },
    });
  }
}
