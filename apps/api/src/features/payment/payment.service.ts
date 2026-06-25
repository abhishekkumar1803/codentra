import { Injectable } from '@nestjs/common';
import { PaymentType } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyPayments(
    userId: string,
    page = 1,
    limit = 20,
    type?: PaymentType,
  ) {
    const where = {
      userId,
      ...(type ? { type } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      meta: { page, limit, total },
    };
  }
}
