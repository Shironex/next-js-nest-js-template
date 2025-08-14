import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomLogger } from '../logger/logger.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private logger: CustomLogger,
  ) {}

  async getWebhookLogs(limit = 100, offset = 0) {
    try {
      const logs = await this.prisma.stripeWebhookLog.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          stripeEventId: true,
          eventType: true,
          status: true,
          processingTimeMs: true,
          createdAt: true,
          processedAt: true,
          errorMessage: true,
          userId: true,
          customerId: true,
          requestBody: true,
          responseBody: true,
        },
      });

      const total = await this.prisma.stripeWebhookLog.count();

      return {
        logs,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error('Failed to fetch webhook logs', error);
      throw error;
    }
  }

  async getWebhookLogById(id: string) {
    try {
      return await this.prisma.stripeWebhookLog.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error('Failed to fetch webhook log', error, { id });
      throw error;
    }
  }

  async getWebhookStats() {
    try {
      const [total, success, failed, processing, ignored] = await Promise.all([
        this.prisma.stripeWebhookLog.count(),
        this.prisma.stripeWebhookLog.count({
          where: { status: 'SUCCESS' },
        }),
        this.prisma.stripeWebhookLog.count({
          where: { status: 'FAILED' },
        }),
        this.prisma.stripeWebhookLog.count({
          where: { status: 'PROCESSING' },
        }),
        this.prisma.stripeWebhookLog.count({
          where: { status: 'IGNORED' },
        }),
      ]);

      const recentFailures = await this.prisma.stripeWebhookLog.findMany({
        where: { status: 'FAILED' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          stripeEventId: true,
          eventType: true,
          errorMessage: true,
          createdAt: true,
        },
      });

      return {
        total,
        success,
        failed,
        processing,
        ignored,
        successRate: total > 0 ? ((success / total) * 100).toFixed(2) : 0,
        recentFailures,
      };
    } catch (error) {
      this.logger.error('Failed to fetch webhook stats', error);
      throw error;
    }
  }

  async getSubscriptionStats() {
    try {
      const [total, free, active, trialing, pastDue, canceled] =
        await Promise.all([
          this.prisma.subscription.count(),
          this.prisma.subscription.count({
            where: { status: 'FREE' },
          }),
          this.prisma.subscription.count({
            where: { status: 'ACTIVE' },
          }),
          this.prisma.subscription.count({
            where: { status: 'TRIALING' },
          }),
          this.prisma.subscription.count({
            where: { status: 'PAST_DUE' },
          }),
          this.prisma.subscription.count({
            where: { status: 'CANCELED' },
          }),
        ]);

      const monthlyRevenue = await this.prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: {
          lastPaymentAmount: true,
        },
      });

      return {
        total,
        free,
        active,
        trialing,
        pastDue,
        canceled,
        monthlyRevenue: monthlyRevenue._sum.lastPaymentAmount || 0,
        conversionRate:
          total > 0 ? (((active + trialing) / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      this.logger.error('Failed to fetch subscription stats', error);
      throw error;
    }
  }
}
