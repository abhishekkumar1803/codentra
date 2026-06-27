import { Injectable } from '@nestjs/common';
import { PaymentStatus, PaymentType, ServiceStatus } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { RazorpayService } from '../razorpay/razorpay.service';
import type { BookServiceDto } from './dto/services.dto';

const SERVICE_CATALOG = [
  {
    type: PaymentType.RESUME_REVIEW,
    title: 'Resume Review',
    description:
      'Expert review with detailed written feedback on structure, content, and ATS fit.',
    amount: 49900,
    durationMinutes: null,
  },
  {
    type: PaymentType.MOCK_INTERVIEW,
    title: 'Mock Interview',
    description:
      'Live 1:1 technical, behavioral, or system design mock interview with a mentor.',
    amount: 99900,
    durationMinutes: 60,
  },
  {
    type: PaymentType.CAREER_CALL,
    title: 'Career Guidance Call',
    description:
      '45-minute career strategy session with a personalized action plan.',
    amount: 79900,
    durationMinutes: 45,
  },
  {
    type: PaymentType.LINKEDIN_REVIEW,
    title: 'LinkedIn Review',
    description:
      'Profile optimization review to improve recruiter visibility and positioning.',
    amount: 39900,
    durationMinutes: null,
  },
] as const;

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpay: RazorpayService,
  ) {}

  getCatalog() {
    return {
      items: SERVICE_CATALOG.map((s) => ({
        type: s.type,
        title: s.title,
        description: s.description,
        amount: s.amount,
        currency: 'INR',
        durationMinutes: s.durationMinutes,
      })),
    };
  }

  async bookService(userId: string, dto: BookServiceDto) {
    const catalogItem = SERVICE_CATALOG.find((s) => s.type === dto.type);
    if (!catalogItem) {
      throw new Error('INVALID_SERVICE_TYPE');
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type: dto.type as PaymentType,
        amount: catalogItem.amount,
        currency: 'INR',
        status: PaymentStatus.PENDING,
        razorpayOrderId: `order_mock_${Date.now()}`,
      },
    });

    if (this.razorpay.isMockMode()) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          paidAt: new Date(),
        },
      });
    }

    const booking = await this.createBookingRecord(
      userId,
      payment.id,
      dto,
      catalogItem.durationMinutes,
    );

    return {
      booking,
      payment: {
        id: payment.id,
        amount: catalogItem.amount,
        currency: 'INR',
        razorpayKeyId: this.razorpay.getKeyId(),
        mockMode: this.razorpay.isMockMode(),
      },
    };
  }

  async getMyBookings(userId: string) {
    const [resumeReviews, mockInterviews, careerCalls, linkedinReviews] =
      await Promise.all([
        this.prisma.resumeReview.findMany({
          where: { userId },
          include: { payment: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.mockInterview.findMany({
          where: { userId },
          include: { payment: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.careerCall.findMany({
          where: { userId },
          include: { payment: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.linkedInReview.findMany({
          where: { userId },
          include: { payment: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const items = [
      ...resumeReviews.map((r) => ({
        id: r.id,
        type: PaymentType.RESUME_REVIEW,
        title: 'Resume Review',
        status: r.status,
        amount: r.payment.amount,
        createdAt: r.createdAt.toISOString(),
      })),
      ...mockInterviews.map((r) => ({
        id: r.id,
        type: PaymentType.MOCK_INTERVIEW,
        title: 'Mock Interview',
        status: r.status,
        amount: r.payment.amount,
        scheduledAt: r.scheduledAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      ...careerCalls.map((r) => ({
        id: r.id,
        type: PaymentType.CAREER_CALL,
        title: 'Career Guidance Call',
        status: r.status,
        amount: r.payment.amount,
        scheduledAt: r.scheduledAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      ...linkedinReviews.map((r) => ({
        id: r.id,
        type: PaymentType.LINKEDIN_REVIEW,
        title: 'LinkedIn Review',
        status: r.status,
        amount: r.payment.amount,
        createdAt: r.createdAt.toISOString(),
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { items };
  }

  async getMentorAssignments(mentorId: string) {
    const [mockInterviews, careerCalls, resumeReviews, linkedinReviews] =
      await Promise.all([
        this.prisma.mockInterview.findMany({
          where: {
            mentorId,
            status: {
              in: [
                ServiceStatus.PENDING,
                ServiceStatus.SCHEDULED,
                ServiceStatus.IN_REVIEW,
              ],
            },
          },
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.careerCall.findMany({
          where: {
            mentorId,
            status: {
              in: [
                ServiceStatus.PENDING,
                ServiceStatus.SCHEDULED,
                ServiceStatus.IN_REVIEW,
              ],
            },
          },
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.resumeReview.findMany({
          where: {
            reviewerId: mentorId,
            status: {
              in: [
                ServiceStatus.PENDING,
                ServiceStatus.SCHEDULED,
                ServiceStatus.IN_REVIEW,
              ],
            },
          },
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.linkedInReview.findMany({
          where: {
            reviewerId: mentorId,
            status: {
              in: [
                ServiceStatus.PENDING,
                ServiceStatus.SCHEDULED,
                ServiceStatus.IN_REVIEW,
              ],
            },
          },
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const items = [
      ...mockInterviews.map((r) => ({
        id: r.id,
        type: PaymentType.MOCK_INTERVIEW,
        title: 'Mock Interview',
        status: r.status,
        user: r.user,
        scheduledAt: r.scheduledAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      ...careerCalls.map((r) => ({
        id: r.id,
        type: PaymentType.CAREER_CALL,
        title: 'Career Guidance Call',
        status: r.status,
        user: r.user,
        scheduledAt: r.scheduledAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      ...resumeReviews.map((r) => ({
        id: r.id,
        type: PaymentType.RESUME_REVIEW,
        title: 'Resume Review',
        status: r.status,
        user: r.user,
        createdAt: r.createdAt.toISOString(),
      })),
      ...linkedinReviews.map((r) => ({
        id: r.id,
        type: PaymentType.LINKEDIN_REVIEW,
        title: 'LinkedIn Review',
        status: r.status,
        user: r.user,
        createdAt: r.createdAt.toISOString(),
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { items };
  }

  private async createBookingRecord(
    userId: string,
    paymentId: string,
    dto: BookServiceDto,
    durationMinutes: number | null,
  ) {
    switch (dto.type) {
      case PaymentType.RESUME_REVIEW:
        return this.prisma.resumeReview.create({
          data: {
            userId,
            paymentId,
            resumeUrl:
              dto.resumeUrl ?? 'https://placeholder.codentra.dev/resume.pdf',
            status: ServiceStatus.PENDING,
          },
        });
      case PaymentType.MOCK_INTERVIEW:
        return this.prisma.mockInterview.create({
          data: {
            userId,
            paymentId,
            durationMinutes: durationMinutes ?? 60,
            scheduledAt: dto.preferredDate ? new Date(dto.preferredDate) : null,
            status: ServiceStatus.PENDING,
          },
        });
      case PaymentType.CAREER_CALL:
        return this.prisma.careerCall.create({
          data: {
            userId,
            paymentId,
            durationMinutes: durationMinutes ?? 45,
            scheduledAt: dto.preferredDate ? new Date(dto.preferredDate) : null,
            notes: dto.notes ?? null,
            status: ServiceStatus.PENDING,
          },
        });
      case PaymentType.LINKEDIN_REVIEW:
        return this.prisma.linkedInReview.create({
          data: {
            userId,
            paymentId,
            linkedinUrl:
              dto.linkedinUrl ?? 'https://linkedin.com/in/your-profile',
            status: ServiceStatus.PENDING,
          },
        });
      default:
        throw new Error('INVALID_SERVICE_TYPE');
    }
  }
}
