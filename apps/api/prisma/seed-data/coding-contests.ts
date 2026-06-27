import {
  ContestStatus,
  ContestType,
  type PrismaClient,
  ProblemDifficulty,
} from '@prisma/client';
import { DEFAULT_STARTER_CODE } from '../../src/features/problems/utils/starter-code.util';

type ProblemSeed = {
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  points: number;
};

const SUM_IO = {
  inputFormat: 'Two space-separated integers a and b',
  outputFormat: 'Print a + b',
  description:
    'Read two integers from standard input and print their sum on a single line.',
};

const PROBLEM_BANK: ProblemSeed[] = [
  {
    title: 'Pair Sum',
    slug: 'pair-sum',
    ...SUM_IO,
    difficulty: 'EASY',
    points: 100,
  },
  {
    title: 'Add Two Numbers',
    slug: 'add-two-numbers',
    ...SUM_IO,
    difficulty: 'EASY',
    points: 120,
  },
  {
    title: 'Integer Addition',
    slug: 'integer-addition',
    ...SUM_IO,
    difficulty: 'MEDIUM',
    points: 150,
  },
];

const DEFAULT_TEST_CASES = [
  { input: '1 2', output: '3', isSample: true, orderIndex: 0 },
  { input: '10 20', output: '30', isSample: true, orderIndex: 1 },
  { input: '100 200', output: '300', isSample: false, orderIndex: 2 },
  { input: '-5 8', output: '3', isSample: false, orderIndex: 3 },
];

async function ensureProblem(
  prisma: PrismaClient,
  contestId: string,
  problem: ProblemSeed,
  orderIndex: number,
) {
  const slug = `${problem.slug}-${orderIndex}`;
  const record = await prisma.problem.upsert({
    where: {
      contestId_slug: { contestId, slug },
    },
    update: {
      starterCode: DEFAULT_STARTER_CODE,
      orderIndex,
    },
    create: {
      contestId,
      title: problem.title,
      slug,
      description: problem.description,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      difficulty: problem.difficulty,
      points: problem.points,
      timeLimitMs: 2000,
      memoryMb: 256,
      orderIndex,
      starterCode: DEFAULT_STARTER_CODE,
    },
  });

  const testCaseCount = await prisma.problemTestCase.count({
    where: { problemId: record.id },
  });

  if (testCaseCount === 0) {
    await prisma.problemTestCase.createMany({
      data: DEFAULT_TEST_CASES.map((tc) => ({
        problemId: record.id,
        ...tc,
      })),
    });
  }

  return record;
}

async function seedCodingContestBatch(
  prisma: PrismaClient,
  adminId: string,
  type: ContestType,
  prefix: string,
  label: string,
  now: Date,
) {
  const configs = Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    const isEnded = n <= 4;
    const slug = `${prefix}-round-${String(n).padStart(2, '0')}`;
    const problemCount = n % 3 === 0 ? 3 : 2;

    const startTime = isEnded
      ? new Date(now.getTime() - (20 - i) * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const endTime = isEnded
      ? new Date(now.getTime() - (18 - i) * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + (3 + i) * 24 * 60 * 60 * 1000);

    return {
      slug,
      title: `${label} Round #${n}`,
      description: `${label} contest round ${n} with ${problemCount} coding problems. ${
        isEnded
          ? 'Ended — virtual join available for practice.'
          : 'Live now — register to compete.'
      }`,
      status: isEnded ? ContestStatus.ENDED : ContestStatus.LIVE,
      startTime,
      endTime,
      problemCount,
    };
  });

  for (const config of configs) {
    const contest = await prisma.contest.upsert({
      where: { slug: config.slug },
      update: {
        status: config.status,
        startTime: config.startTime,
        endTime: config.endTime,
      },
      create: {
        title: config.title,
        slug: config.slug,
        description: config.description,
        type,
        status: config.status,
        startTime: config.startTime,
        endTime: config.endTime,
        durationMinutes: type === ContestType.DSA ? 120 : 180,
        maxParticipants: 500,
        createdById: adminId,
      },
    });

    for (let p = 0; p < config.problemCount; p++) {
      const template = PROBLEM_BANK[p % PROBLEM_BANK.length]!;
      await ensureProblem(prisma, contest.id, template, p);
    }
  }
}

export async function seedCodingContests(
  prisma: PrismaClient,
  adminId: string,
  now: Date,
) {
  await seedCodingContestBatch(
    prisma,
    adminId,
    ContestType.DSA,
    'dsa',
    'DSA',
    now,
  );
  await seedCodingContestBatch(
    prisma,
    adminId,
    ContestType.COMPETITIVE_PROGRAMMING,
    'cp',
    'CP',
    now,
  );
}
