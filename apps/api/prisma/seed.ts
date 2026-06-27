import {
  ContestStatus,
  ContestType,
  JobType,
  PrismaClient,
  RatingType,
  Role,
  SubscriptionStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DEFAULT_STARTER_CODE } from '../src/features/problems/utils/starter-code.util';
import { seedCodingContests } from './seed-data/coding-contests';
import { seedQuizContests } from './seed-data/quiz-contests';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@codentra.dev';
const DEMO_EMAIL = 'demo@codentra.dev';
const SEED_PASSWORD = 'Admin123!';

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: Role.ADMIN,
      passwordHash,
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: ADMIN_EMAIL,
      name: 'Codentra Admin',
      passwordHash,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash, isActive: true },
    create: {
      email: DEMO_EMAIL,
      name: 'Demo User',
      passwordHash,
      role: Role.USER,
    },
  });

  await prisma.profile.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      bio: 'Full-stack developer learning DSA and system design.',
      skills: ['TypeScript', 'React', 'Node.js'],
    },
  });

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.subscription.upsert({
    where: { userId: demo.id },
    update: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    create: {
      userId: demo.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  await seedQuizContests(prisma, admin.id, now);
  await seedCodingContests(prisma, admin.id, now);

  await prisma.contest.upsert({
    where: { slug: 'weekly-dsa-challenge' },
    update: {
      status: ContestStatus.ENDED,
      startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    create: {
      title: 'Weekly DSA Challenge #1',
      slug: 'weekly-dsa-challenge',
      description:
        'Practice array and string problems in this beginner-friendly DSA contest.',
      type: ContestType.DSA,
      status: ContestStatus.ENDED,
      startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      durationMinutes: 120,
      maxParticipants: 500,
      createdById: admin.id,
    },
  });

  const dsaContest = await prisma.contest.findUnique({
    where: { slug: 'weekly-dsa-challenge' },
  });

  if (dsaContest) {
    const sumProblem = await prisma.problem.upsert({
      where: {
        contestId_slug: {
          contestId: dsaContest.id,
          slug: 'sum-two-numbers',
        },
      },
      update: {
        starterCode: DEFAULT_STARTER_CODE,
      },
      create: {
        contestId: dsaContest.id,
        title: 'Sum Two Numbers',
        slug: 'sum-two-numbers',
        description:
          'Read two integers from standard input and print their sum.',
        inputFormat: 'Two space-separated integers a and b',
        outputFormat: 'Print a + b',
        difficulty: 'EASY',
        points: 100,
        timeLimitMs: 2000,
        memoryMb: 256,
        orderIndex: 0,
        starterCode: DEFAULT_STARTER_CODE,
      },
    });

    const testCaseCount = await prisma.problemTestCase.count({
      where: { problemId: sumProblem.id },
    });

    if (testCaseCount === 0) {
      await prisma.problemTestCase.createMany({
        data: [
          {
            problemId: sumProblem.id,
            input: '1 2',
            output: '3',
            isSample: true,
            orderIndex: 0,
          },
          {
            problemId: sumProblem.id,
            input: '10 20',
            output: '30',
            isSample: false,
            orderIndex: 1,
          },
          {
            problemId: sumProblem.id,
            input: '-5 8',
            output: '3',
            isSample: false,
            orderIndex: 2,
          },
        ],
      });
    }

    await prisma.contestParticipant.upsert({
      where: {
        contestId_userId: { contestId: dsaContest.id, userId: demo.id },
      },
      update: { score: 100, status: 'SUBMITTED' },
      create: {
        contestId: dsaContest.id,
        userId: demo.id,
        score: 100,
        status: 'SUBMITTED',
        rank: 1,
      },
    });

    await prisma.contestParticipant.upsert({
      where: {
        contestId_userId: { contestId: dsaContest.id, userId: admin.id },
      },
      update: { score: 0, status: 'REGISTERED' },
      create: {
        contestId: dsaContest.id,
        userId: admin.id,
        score: 0,
        status: 'REGISTERED',
        rank: 2,
      },
    });
  }

  await prisma.contest.upsert({
    where: { slug: 'icpc-practice-round-1' },
    update: {},
    create: {
      title: 'ICPC Practice Round #1',
      slug: 'icpc-practice-round-1',
      description:
        'Competitive programming warm-up before the real contest season.',
      type: ContestType.COMPETITIVE_PROGRAMMING,
      status: ContestStatus.SCHEDULED,
      startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      durationMinutes: 180,
      maxParticipants: 200,
      createdById: admin.id,
    },
  });

  await prisma.contest.upsert({
    where: { slug: 'design-url-shortener' },
    update: {},
    create: {
      title: 'Design a URL Shortener',
      slug: 'design-url-shortener',
      description:
        'Design a scalable URL shortening service like bit.ly. Cover API design, storage, caching, rate limiting, and analytics.',
      type: ContestType.SYSTEM_DESIGN,
      status: ContestStatus.LIVE,
      startTime: new Date(now.getTime() - 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      durationMinutes: 90,
      createdById: admin.id,
    },
  });

  const jobCount = await prisma.job.count();
  if (jobCount === 0) {
    await prisma.job.createMany({
      data: [
        {
          title: 'Software Engineer — Backend',
          company: 'Razorpay',
          description:
            'Build payment infrastructure at scale. 2+ years Node.js/Go experience. Work on APIs, databases, and distributed systems.',
          location: 'Bengaluru',
          jobType: JobType.HYBRID,
          salaryMin: 2500000,
          salaryMax: 4500000,
          applyUrl: 'https://razorpay.com/jobs',
          postedById: admin.id,
        },
        {
          title: 'Frontend Engineer',
          company: 'CRED',
          description:
            'React/Next.js expert needed for consumer-facing products. Strong TypeScript and performance skills required.',
          location: 'Remote',
          jobType: JobType.REMOTE,
          salaryMin: 3000000,
          salaryMax: 5000000,
          applyUrl: 'https://cred.club/careers',
          postedById: admin.id,
        },
      ],
    });
  }

  const referralCount = await prisma.referral.count();
  if (referralCount === 0) {
    await prisma.referral.create({
      data: {
        referrerId: demo.id,
        company: 'Google',
        roleTitle: 'L4 Software Engineer',
        description:
          'Looking to refer strong backend engineers for the Cloud team. Must have 3+ years experience with distributed systems.',
        requirements: '3+ years backend, system design skills',
        contactEmail: 'demo@codentra.dev',
      },
    });
  }

  const historyCount = await prisma.ratingHistory.count({
    where: { userId: demo.id },
  });
  if (historyCount === 0) {
    const baseDate = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const dsaRatings = [1150, 1168, 1180, 1192, 1200];
    for (let i = 0; i < dsaRatings.length; i++) {
      await prisma.ratingHistory.create({
        data: {
          userId: demo.id,
          type: RatingType.DSA,
          rating: dsaRatings[i]!,
          delta: i === 0 ? 0 : dsaRatings[i]! - dsaRatings[i - 1]!,
          reason: i === 0 ? 'Initial rating' : 'Contest performance',
          createdAt: new Date(baseDate + i * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
    const cpRatings = [1100, 1125, 1150, 1180, 1200];
    for (let i = 0; i < cpRatings.length; i++) {
      await prisma.ratingHistory.create({
        data: {
          userId: demo.id,
          type: RatingType.CP,
          rating: cpRatings[i]!,
          delta: i === 0 ? 0 : cpRatings[i]! - cpRatings[i - 1]!,
          reason: i === 0 ? 'Initial rating' : 'Contest performance',
          createdAt: new Date(baseDate + i * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('Seed complete.');
  console.log(
    '  Contests: 10 DSA + 10 CP (4 ended, 6 live each) with 2–3 problems',
  );
  console.log('  Quizzes: Java, React, JavaScript, DevOps (10 questions each)');
  console.log(`  Admin: ${ADMIN_EMAIL} / ${SEED_PASSWORD}`);
  console.log(`  Demo:  ${DEMO_EMAIL} / ${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
