import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ContestStatus,
  ContestType,
  RatingType,
  SubmissionVerdict,
  type User,
} from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import {
  getRatingTitle,
  ratingDeltaForSolve,
} from '../../common/utils/rating.util';
import type {
  CreateProblemDto,
  CreateTestCaseDto,
  ListSubmissionsQueryDto,
  RunCodeDto,
  SubmitCodeDto,
} from './dto/problem.dto';
import { mockJudge } from './utils/mock-judge.util';
import { DEFAULT_STARTER_CODE } from './utils/starter-code.util';
import {
  evaluateTestCases,
  sanitizeVerdictDetails,
  type VerdictDetails,
} from './utils/verdict.util';
import { uniqueSlug } from '../contests/utils/slug.util';

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async listProblems(contestSlug: string) {
    const contest = await this.getCodingContest(contestSlug);
    const problems = await this.prisma.problem.findMany({
      where: { contestId: contest.id },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        points: true,
        orderIndex: true,
      },
    });
    return { items: problems };
  }

  async getProblem(contestSlug: string, problemSlug: string, userId: string) {
    const contest = await this.getCodingContest(contestSlug);
    const problem = await this.getProblemOrThrow(contest.id, problemSlug);
    const contestEnded = contest.status === ContestStatus.ENDED;

    const [allTestCases, bestSubmission, registration] = await Promise.all([
      this.prisma.problemTestCase.findMany({
        where: { problemId: problem.id },
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.codeSubmission.findFirst({
        where: {
          problemId: problem.id,
          userId,
          verdict: SubmissionVerdict.ACCEPTED,
        },
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.contestParticipant.findUnique({
        where: {
          contestId_userId: { contestId: contest.id, userId },
        },
      }),
    ]);

    const sampleTestCases = allTestCases
      .filter((tc) => tc.isSample)
      .map((tc) => ({
        id: tc.id,
        input: tc.input,
        output: tc.output,
        isSample: true,
      }));

    const hiddenTestCaseCount = allTestCases.filter((tc) => !tc.isSample).length;

    const requiresRegistration =
      contest.status === ContestStatus.LIVE ||
      contest.status === ContestStatus.ENDED;

    if (requiresRegistration && !registration) {
      throw new ForbiddenException('NOT_REGISTERED');
    }

    return {
      id: problem.id,
      contestId: contest.id,
      contestSlug: contest.slug,
      contestStatus: contest.status,
      contestEnded,
      title: problem.title,
      slug: problem.slug,
      description: problem.description,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      difficulty: problem.difficulty,
      points: problem.points,
      timeLimitMs: problem.timeLimitMs,
      memoryMb: problem.memoryMb,
      starterCode: problem.starterCode as Record<string, string>,
      sampleTestCases,
      hiddenTestCaseCount,
      isRegistered: !!registration,
      isVirtual: registration?.isVirtual ?? false,
      isSolved: !!bestSubmission,
      scoreAwarded: bestSubmission?.score ?? 0,
    };
  }

  async runCode(
    contestSlug: string,
    problemSlug: string,
    userId: string,
    dto: RunCodeDto,
  ) {
    const contest = await this.getCodingContest(contestSlug);
    await this.ensureRegistered(contest.id, userId);
    const problem = await this.getProblemOrThrow(contest.id, problemSlug);

    if (dto.runSamples) {
      const samples = await this.prisma.problemTestCase.findMany({
        where: { problemId: problem.id, isSample: true },
        orderBy: { orderIndex: 'asc' },
      });

      const results = samples.map((tc, i) => {
        const result = mockJudge(
          dto.sourceCode,
          tc.input,
          tc.output,
          problem.timeLimitMs,
        );
        return {
          index: i + 1,
          input: tc.input,
          verdict: result.verdict,
          output: result.output,
          expectedOutput: tc.output,
          runtimeMs: result.runtimeMs,
        };
      });

      const allPassed = results.every((r) => r.verdict === SubmissionVerdict.ACCEPTED);
      return {
        mode: 'samples' as const,
        verdict: allPassed
          ? SubmissionVerdict.ACCEPTED
          : results.find((r) => r.verdict !== SubmissionVerdict.ACCEPTED)!
              .verdict,
        results,
      };
    }

    if (!dto.input?.trim()) {
      throw new BadRequestException('INPUT_REQUIRED');
    }

    const testCase = await this.prisma.problemTestCase.findFirst({
      where: { problemId: problem.id, input: dto.input },
    });

    const expected = testCase?.output ?? this.inferExpectedOutput(dto.input);
    const result = mockJudge(
      dto.sourceCode,
      dto.input,
      expected,
      problem.timeLimitMs,
    );

    return {
      mode: 'custom' as const,
      verdict: result.verdict,
      output: result.output,
      expectedOutput: expected,
      runtimeMs: result.runtimeMs,
      isSampleInput: testCase?.isSample ?? false,
    };
  }

  async submitCode(
    contestSlug: string,
    problemSlug: string,
    user: User,
    dto: SubmitCodeDto,
  ) {
    const contest = await this.getCodingContest(contestSlug);
    const registration = await this.getRegistrationOrThrow(contest.id, user.id);

    if (contest.status === ContestStatus.SCHEDULED) {
      throw new BusinessException(
        'CONTEST_NOT_LIVE',
        'Submissions open when the contest goes live.',
      );
    }

    const isPracticeMode =
      contest.status === ContestStatus.ENDED || registration.isVirtual;

    if (contest.status !== ContestStatus.LIVE && !isPracticeMode) {
      throw new BusinessException(
        'CONTEST_NOT_LIVE',
        'Submissions are only accepted while the contest is live.',
      );
    }

    const problem = await this.getProblemOrThrow(contest.id, problemSlug);
    const testCases = await this.prisma.problemTestCase.findMany({
      where: { problemId: problem.id },
      orderBy: { orderIndex: 'asc' },
    });

    if (testCases.length === 0) {
      throw new BadRequestException('NO_TEST_CASES');
    }

    const evaluation = evaluateTestCases(
      dto.sourceCode,
      testCases,
      mockJudge,
      problem.timeLimitMs,
    );

    const existingAccepted = await this.prisma.codeSubmission.findFirst({
      where: {
        problemId: problem.id,
        userId: user.id,
        verdict: SubmissionVerdict.ACCEPTED,
      },
    });

    const countsForScore =
      contest.status === ContestStatus.LIVE && !registration.isVirtual;

    const score =
      countsForScore &&
      evaluation.verdict === SubmissionVerdict.ACCEPTED &&
      !existingAccepted
        ? problem.points
        : 0;

    const submission = await this.prisma.codeSubmission.create({
      data: {
        problemId: problem.id,
        contestId: contest.id,
        userId: user.id,
        language: dto.language,
        sourceCode: dto.sourceCode,
        verdict: evaluation.verdict,
        score,
        runtimeMs: evaluation.runtimeMs,
        verdictDetails: evaluation.details ?? undefined,
      },
    });

    if (score > 0) {
      await this.prisma.contestParticipant.update({
        where: {
          contestId_userId: { contestId: contest.id, userId: user.id },
        },
        data: { score: { increment: score } },
      });

      await this.applyRatingGain(user.id, contest.type, problem.difficulty, contest.id);
    }

    return this.formatSubmission(submission);
  }

  async listSubmissions(
    contestSlug: string,
    problemSlug: string,
    userId: string,
    query: ListSubmissionsQueryDto,
  ) {
    const contest = await this.getCodingContest(contestSlug);
    const problem = await this.getProblemOrThrow(contest.id, problemSlug);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = { problemId: problem.id, userId };

    const [items, total] = await Promise.all([
      this.prisma.codeSubmission.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.codeSubmission.count({ where }),
    ]);

    return {
      items: items.map((s) => this.formatSubmission(s)),
      meta: { page, limit, total },
    };
  }

  async getSubmission(
    contestSlug: string,
    problemSlug: string,
    submissionId: string,
    userId: string,
  ) {
    const contest = await this.getCodingContest(contestSlug);
    const problem = await this.getProblemOrThrow(contest.id, problemSlug);

    const submission = await this.prisma.codeSubmission.findFirst({
      where: {
        id: submissionId,
        problemId: problem.id,
        userId,
      },
    });

    if (!submission) {
      throw new NotFoundException('SUBMISSION_NOT_FOUND');
    }

    return this.formatSubmission(submission);
  }

  async adminListProblems(contestId: string) {
    const problems = await this.prisma.problem.findMany({
      where: { contestId },
      orderBy: { orderIndex: 'asc' },
      include: {
        testCases: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { submissions: true } },
      },
    });
    return { items: problems };
  }

  async adminCreateProblem(contestId: string, dto: CreateProblemDto) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId, deletedAt: null },
    });
    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    const slug = await uniqueSlug(dto.title, async (s) => {
      const found = await this.prisma.problem.findFirst({
        where: { contestId, slug: s },
      });
      return !!found;
    });
    const count = await this.prisma.problem.count({
      where: { contestId },
    });

    return this.prisma.problem.create({
      data: {
        contestId,
        title: dto.title,
        slug,
        description: dto.description,
        inputFormat: dto.inputFormat,
        outputFormat: dto.outputFormat,
        difficulty: dto.difficulty ?? 'EASY',
        points: dto.points ?? 100,
        timeLimitMs: dto.timeLimitMs ?? 2000,
        memoryMb: dto.memoryMb ?? 256,
        starterCode: dto.starterCode ?? DEFAULT_STARTER_CODE,
        orderIndex: dto.orderIndex ?? count,
      },
    });
  }

  async adminAddTestCase(problemId: string, dto: CreateTestCaseDto) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
    });
    if (!problem) {
      throw new NotFoundException('PROBLEM_NOT_FOUND');
    }

    const count = await this.prisma.problemTestCase.count({
      where: { problemId },
    });

    return this.prisma.problemTestCase.create({
      data: {
        problemId,
        input: dto.input,
        output: dto.output,
        isSample: dto.isSample ?? false,
        orderIndex: dto.orderIndex ?? count,
      },
    });
  }

  async adminDeleteProblem(problemId: string) {
    await this.prisma.problem.delete({ where: { id: problemId } });
    return { message: 'Problem deleted.' };
  }

  async adminDeleteTestCase(testCaseId: string) {
    await this.prisma.problemTestCase.delete({ where: { id: testCaseId } });
    return { message: 'Test case deleted.' };
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

  private async getCodingContest(slug: string) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        slug,
        deletedAt: null,
        type: { in: [ContestType.DSA, ContestType.COMPETITIVE_PROGRAMMING] },
      },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    return contest;
  }

  private async getProblemOrThrow(contestId: string, problemSlug: string) {
    const problem = await this.prisma.problem.findFirst({
      where: { contestId, slug: problemSlug },
    });

    if (!problem) {
      throw new NotFoundException('PROBLEM_NOT_FOUND');
    }

    return problem;
  }

  private async ensureRegistered(contestId: string, userId: string) {
    await this.getRegistrationOrThrow(contestId, userId);
  }

  private async getRegistrationOrThrow(contestId: string, userId: string) {
    const registration = await this.prisma.contestParticipant.findUnique({
      where: { contestId_userId: { contestId, userId } },
    });

    if (!registration) {
      throw new ForbiddenException('NOT_REGISTERED');
    }

    return registration;
  }

  private inferExpectedOutput(input: string): string {
    const parts = input.trim().split(/\s+/).map(Number);
    if (parts.length >= 2 && !parts.some((n) => Number.isNaN(n))) {
      return String(parts[0]! + parts[1]!);
    }
    return '';
  }

  private formatSubmission(
    submission: {
      id: string;
      language: string;
      sourceCode: string;
      verdict: string;
      score: number;
      runtimeMs: number | null;
      verdictDetails: unknown;
      submittedAt: Date;
    },
  ) {
    const details = sanitizeVerdictDetails(
      submission.verdictDetails as VerdictDetails | null,
    );

    return {
      id: submission.id,
      language: submission.language,
      sourceCode: submission.sourceCode,
      verdict: submission.verdict,
      score: submission.score,
      runtimeMs: submission.runtimeMs,
      verdictDetails: details,
      submittedAt: submission.submittedAt.toISOString(),
    };
  }
}
