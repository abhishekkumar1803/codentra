import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContestStatus,
  ContestType,
  ParticipantStatus,
  Prisma,
  type User,
} from '@prisma/client';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { NotificationsService } from '../notifications/notifications.service';
import type {
  CreateQuizQuestionDto,
  SubmitQuizDto,
  UpdateQuizQuestionDto,
} from './dto/quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly leaderboardsService: LeaderboardsService,
  ) {}

  async getQuizBySlug(slug: string, userId: string) {
    const contest = await this.findQuizContestBySlug(slug);
    const participant = await this.requireParticipant(contest.id, userId);

    if (participant.status === ParticipantStatus.SUBMITTED) {
      throw new ConflictException('QUIZ_ALREADY_SUBMITTED');
    }

    if (contest.status !== ContestStatus.LIVE) {
      throw new BusinessException(
        'QUIZ_NOT_AVAILABLE',
        'Quiz is only available while the contest is live',
      );
    }

    if (participant.status === ParticipantStatus.REGISTERED) {
      await this.prisma.contestParticipant.update({
        where: { id: participant.id },
        data: { status: ParticipantStatus.IN_PROGRESS },
      });
    }

    const questions = await this.prisma.quizQuestion.findMany({
      where: { contestId: contest.id },
      orderBy: { orderIndex: 'asc' },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (questions.length === 0) {
      throw new BusinessException(
        'QUIZ_NO_QUESTIONS',
        'This quiz has no questions yet',
      );
    }

    return {
      contestId: contest.id,
      title: contest.title,
      slug: contest.slug,
      status: contest.status,
      durationMinutes: contest.durationMinutes,
      endTime: contest.endTime,
      participantStatus: ParticipantStatus.IN_PROGRESS,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        points: q.points,
        orderIndex: q.orderIndex,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          orderIndex: o.orderIndex,
        })),
      })),
    };
  }

  async submitQuiz(contestId: string, user: User, dto: SubmitQuizDto) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        deletedAt: null,
        type: ContestType.QUIZ,
      },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    if (contest.status !== ContestStatus.LIVE) {
      throw new BusinessException(
        'QUIZ_NOT_AVAILABLE',
        'Quiz can only be submitted while the contest is live',
      );
    }

    const participant = await this.requireParticipant(contestId, user.id);

    if (participant.status === ParticipantStatus.SUBMITTED) {
      throw new ConflictException('QUIZ_ALREADY_SUBMITTED');
    }

    const questions = await this.prisma.quizQuestion.findMany({
      where: { contestId },
      include: { options: true },
    });

    if (questions.length === 0) {
      throw new BusinessException('QUIZ_NO_QUESTIONS', 'Quiz has no questions');
    }

    if (dto.answers.length !== questions.length) {
      throw new BadRequestException('QUIZ_INCOMPLETE');
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const answerRows: {
      participantId: string;
      questionId: string;
      optionId: string;
      isCorrect: boolean;
    }[] = [];
    let score = 0;

    for (const answer of dto.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        throw new BadRequestException('INVALID_QUESTION');
      }

      const option = question.options.find((o) => o.id === answer.optionId);
      if (!option) {
        throw new BadRequestException('INVALID_OPTION');
      }

      const isCorrect = option.isCorrect;
      if (isCorrect) {
        score += question.points;
      }

      answerRows.push({
        participantId: participant.id,
        questionId: question.id,
        optionId: option.id,
        isCorrect,
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.quizAnswer.createMany({ data: answerRows });

      await tx.contestParticipant.update({
        where: { id: participant.id },
        data: {
          score,
          status: ParticipantStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });

      await this.recalculateRanks(tx, contestId);
    });

    void this.leaderboardsService.refreshGlobalLeaderboards();

    const results = await this.getResults(contestId, user.id);

    void this.notificationsService.create(
      user.id,
      NotificationType.CONTEST_RESULT,
      `Quiz results: ${contest.title}`,
      `You scored ${results.score}/${results.totalPoints} points${
        results.rank ? ` and ranked #${results.rank}` : ''
      }.`,
      { contestId, slug: contest.slug },
    );

    return results;
  }

  async getResults(contestId: string, userId: string) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        deletedAt: null,
        type: ContestType.QUIZ,
      },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    const participant = await this.prisma.contestParticipant.findUnique({
      where: { contestId_userId: { contestId, userId } },
      include: {
        quizAnswers: {
          include: {
            question: { include: { options: { orderBy: { orderIndex: 'asc' } } } },
            option: true,
          },
        },
      },
    });

    if (!participant) {
      throw new BusinessException(
        'NOT_REGISTERED',
        'You must register for this contest first',
        403,
      );
    }

    if (participant.status !== ParticipantStatus.SUBMITTED) {
      throw new BusinessException(
        'QUIZ_NOT_SUBMITTED',
        'Submit the quiz to view results',
      );
    }

    const totalPoints = await this.prisma.quizQuestion.aggregate({
      where: { contestId },
      _sum: { points: true },
    });

    const questions = await this.prisma.quizQuestion.findMany({
      where: { contestId },
      orderBy: { orderIndex: 'asc' },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });

    const answerByQuestion = new Map(
      participant.quizAnswers.map((a) => [a.questionId, a]),
    );

    return {
      contestId: contest.id,
      title: contest.title,
      slug: contest.slug,
      score: participant.score,
      totalPoints: totalPoints._sum.points ?? 0,
      rank: participant.rank,
      submittedAt: participant.submittedAt,
      questions: questions.map((q) => {
        const answer = answerByQuestion.get(q.id);
        const correctOption = q.options.find((o) => o.isCorrect);
        return {
          id: q.id,
          text: q.text,
          points: q.points,
          selectedOptionId: answer?.optionId ?? null,
          correctOptionId: correctOption?.id ?? null,
          isCorrect: answer?.isCorrect ?? false,
          options: q.options.map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        };
      }),
    };
  }

  // ── Admin ─────────────────────────────────────────

  async adminListQuestions(contestId: string) {
    await this.requireQuizContestById(contestId);

    const questions = await this.prisma.quizQuestion.findMany({
      where: { contestId },
      orderBy: { orderIndex: 'asc' },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });

    return { items: questions.map((q) => this.formatAdminQuestion(q)) };
  }

  async adminCreateQuestion(contestId: string, dto: CreateQuizQuestionDto) {
    await this.requireQuizContestById(contestId);
    this.validateOptions(dto.options);

    const question = await this.prisma.quizQuestion.create({
      data: {
        contestId,
        text: dto.text,
        points: dto.points ?? 1,
        orderIndex: dto.orderIndex,
        options: {
          create: dto.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            orderIndex: o.orderIndex,
          })),
        },
      },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });

    return this.formatAdminQuestion(question);
  }

  async adminUpdateQuestion(
    contestId: string,
    questionId: string,
    dto: UpdateQuizQuestionDto,
  ) {
    await this.requireQuizContestById(contestId);

    const existing = await this.prisma.quizQuestion.findFirst({
      where: { id: questionId, contestId },
    });

    if (!existing) {
      throw new NotFoundException('QUESTION_NOT_FOUND');
    }

    if (dto.options) {
      this.validateOptions(dto.options);
    }

    const question = await this.prisma.$transaction(async (tx) => {
      if (dto.options) {
        await tx.quizOption.deleteMany({ where: { questionId } });
      }

      return tx.quizQuestion.update({
        where: { id: questionId },
        data: {
          ...(dto.text !== undefined ? { text: dto.text } : {}),
          ...(dto.points !== undefined ? { points: dto.points } : {}),
          ...(dto.orderIndex !== undefined ? { orderIndex: dto.orderIndex } : {}),
          ...(dto.options
            ? {
                options: {
                  create: dto.options.map((o) => ({
                    text: o.text,
                    isCorrect: o.isCorrect,
                    orderIndex: o.orderIndex,
                  })),
                },
              }
            : {}),
        },
        include: { options: { orderBy: { orderIndex: 'asc' } } },
      });
    });

    return this.formatAdminQuestion(question);
  }

  async adminDeleteQuestion(contestId: string, questionId: string) {
    await this.requireQuizContestById(contestId);

    const existing = await this.prisma.quizQuestion.findFirst({
      where: { id: questionId, contestId },
    });

    if (!existing) {
      throw new NotFoundException('QUESTION_NOT_FOUND');
    }

    await this.prisma.quizQuestion.delete({ where: { id: questionId } });

    return { message: 'Question deleted.' };
  }

  private async findQuizContestBySlug(slug: string) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        slug,
        deletedAt: null,
        type: ContestType.QUIZ,
        status: { in: [ContestStatus.LIVE, ContestStatus.ENDED] },
      },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    return contest;
  }

  private async requireQuizContestById(contestId: string) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId, deletedAt: null, type: ContestType.QUIZ },
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

  private validateOptions(
    options: { isCorrect: boolean }[],
  ) {
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException('QUIZ_INVALID_OPTIONS');
    }
  }

  private async recalculateRanks(
    tx: Prisma.TransactionClient,
    contestId: string,
  ) {
    const participants = await tx.contestParticipant.findMany({
      where: { contestId, status: ParticipantStatus.SUBMITTED },
      orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
    });

    await Promise.all(
      participants.map((p, index) =>
        tx.contestParticipant.update({
          where: { id: p.id },
          data: { rank: index + 1 },
        }),
      ),
    );
  }

  private formatAdminQuestion(question: {
    id: string;
    contestId: string;
    text: string;
    points: number;
    orderIndex: number;
    createdAt: Date;
    updatedAt: Date;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      orderIndex: number;
    }[];
  }) {
    return {
      id: question.id,
      contestId: question.contestId,
      text: question.text,
      points: question.points,
      orderIndex: question.orderIndex,
      options: question.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
        orderIndex: o.orderIndex,
      })),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
