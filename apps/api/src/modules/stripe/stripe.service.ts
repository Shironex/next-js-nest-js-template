import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  SubscriptionStatus,
  WebhookStatus,
  BillingInterval,
} from '../../../generated/prisma';
import { ILogger } from '../logger/logger.interface';
import { LoggerFactory } from '../logger/logger.factory';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger: ILogger;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private loggerFactory: LoggerFactory,
    private mailService: MailService,
  ) {
    this.logger = this.loggerFactory.createLogger(StripeService.name);
    this.stripe = new Stripe(
      this.configService.get('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2025-10-29.clover',
      },
    );
  }

  async createCustomer(
    userId: string,
    email: string,
    name?: string,
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      await this.prisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: customer.id,
          status: SubscriptionStatus.FREE,
        },
      });

      this.logger.info(
        `Stripe customer created for user ${userId}, customer ID: ${customer.id}`,
      );

      return customer;
    } catch (error) {
      this.logger.error('Failed to create Stripe customer', error, {
        userId,
        email,
      });
      throw error;
    }
  }

  async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      this.logger.debug(
        `Starting createCheckoutSession for userId: ${userId}, priceId: ${priceId}`,
      );

      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      this.logger.debug(
        `Found subscription: exists=${!!subscription}, hasCustomerId=${!!subscription?.stripeCustomerId}, status=${subscription?.status}`,
      );

      if (!subscription || !subscription.stripeCustomerId) {
        this.logger.debug(
          `Creating new customer - hasSubscription=${!!subscription}, hasCustomerId=${!!subscription?.stripeCustomerId}`,
        );

        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          this.logger.error(`User not found for userId: ${userId}`);
          throw new Error('User not found');
        }

        this.logger.debug(`Found user ${user.email}, creating Stripe customer`);

        const customer = await this.createCustomer(
          userId,
          user.email,
          user.username,
        );

        this.logger.debug(
          `Created customer ${customer.id}, creating checkout session`,
        );

        const checkoutSessionData: Stripe.Checkout.SessionCreateParams = {
          customer: customer.id,
          payment_method_types: ['card'],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            userId,
          },
        };

        this.logger.debug(
          `Checkout session data for new customer:`,
          JSON.stringify(checkoutSessionData),
        );

        return this.stripe.checkout.sessions.create(checkoutSessionData);
      }

      this.logger.debug(
        `Using existing customer ${subscription.stripeCustomerId} for checkout session`,
      );

      const checkoutSessionData: Stripe.Checkout.SessionCreateParams = {
        customer: subscription.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
      };

      this.logger.debug(
        `Checkout session data for existing customer:`,
        JSON.stringify(checkoutSessionData),
      );

      return this.stripe.checkout.sessions.create(checkoutSessionData);
    } catch (error) {
      this.logger.error('Failed to create checkout session', error, {
        userId,
        priceId,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      throw error;
    }
  }

  async createPortalSession(
    userId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      this.logger.debug(
        `Starting createPortalSession for userId: ${userId}, returnUrl: ${returnUrl}`,
      );

      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      this.logger.debug(
        `Found subscription: exists=${!!subscription}, hasCustomerId=${!!subscription?.stripeCustomerId}, status=${subscription?.status}`,
      );

      if (!subscription) {
        this.logger.error(`No subscription found for user ${userId}`);
        throw new Error('No subscription found for user');
      }

      if (!subscription.stripeCustomerId) {
        this.logger.error(`No stripeCustomerId found for user ${userId}`);
        throw new Error('No Stripe customer ID found for subscription');
      }

      this.logger.debug(
        `Creating portal session for customer ${subscription.stripeCustomerId}`,
      );

      const portalSessionData = {
        customer: subscription.stripeCustomerId,
        return_url: returnUrl,
      };

      this.logger.debug(
        `Portal session data:`,
        JSON.stringify(portalSessionData),
      );

      return this.stripe.billingPortal.sessions.create(portalSessionData);
    } catch (error) {
      this.logger.error('Failed to create portal session', error, {
        userId,
        returnUrl,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      throw error;
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        },
      );

      await this.prisma.subscription.update({
        where: { userId },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
        },
      });

      this.logger.info(
        `Subscription canceled for user ${userId}, subscription ID: ${subscription.stripeSubscriptionId}`,
      );
    } catch (error) {
      this.logger.error('Failed to cancel subscription', error, {
        userId,
      });
      throw error;
    }
  }

  async handleWebhookEvent(
    event: Stripe.Event,
    signature: string,
    rawBody: string,
  ): Promise<void> {
    const startTime = Date.now();
    let webhookLog;

    try {
      webhookLog = await this.prisma.stripeWebhookLog.create({
        data: {
          stripeEventId: event.id,
          eventType: event.type,
          apiVersion: event.api_version || null,
          status: WebhookStatus.PROCESSING,
          requestBody: event as any,
          signature,
        },
      });

      const webhookSecret =
        this.configService.get('STRIPE_WEBHOOK_SECRET') || '';

      try {
        this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch {
        await this.prisma.stripeWebhookLog.update({
          where: { id: webhookLog.id },
          data: {
            status: WebhookStatus.FAILED,
            errorMessage: 'Invalid signature',
            processingTimeMs: Date.now() - startTime,
            processedAt: new Date(),
          },
        });
        throw new Error('Invalid webhook signature');
      }

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(
            event.data.object,
            webhookLog.id,
          );
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object, webhookLog.id);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(
            event.data.object,
            webhookLog.id,
          );
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(
            event.data.object,
            webhookLog.id,
          );
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(
            event.data.object,
            webhookLog.id,
          );
          break;

        default:
          await this.prisma.stripeWebhookLog.update({
            where: { id: webhookLog.id },
            data: {
              status: WebhookStatus.IGNORED,
              processingTimeMs: Date.now() - startTime,
              processedAt: new Date(),
            },
          });
          this.logger.info(`Unhandled webhook event type: ${event.type}`);
          return;
      }

      await this.prisma.stripeWebhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: WebhookStatus.SUCCESS,
          processingTimeMs: Date.now() - startTime,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Webhook processing failed', error, {
        eventId: event.id,
        eventType: event.type,
      });

      if (webhookLog) {
        await this.prisma.stripeWebhookLog.update({
          where: { id: webhookLog.id },
          data: {
            status: WebhookStatus.FAILED,
            errorMessage: error.message,
            errorStack: error.stack,
            processingTimeMs: Date.now() - startTime,
            processedAt: new Date(),
          },
        });
      }

      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
    webhookLogId: string,
  ): Promise<void> {
    const userId = session.metadata?.userId;

    if (!userId) {
      throw new Error('No userId in checkout session metadata');
    }

    await this.prisma.stripeWebhookLog.update({
      where: { id: webhookLogId },
      data: {
        userId,
        customerId: session.customer as string,
      },
    });

    this.logger.info(
      `Checkout session completed for user ${userId}, session ID: ${session.id}`,
    );
  }

  private async handleSubscriptionUpdate(
    subscription: Stripe.Subscription,
    webhookLogId: string,
  ): Promise<void> {
    const customerId = subscription.customer as string;

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!existingSubscription) {
      this.logger.warn('Subscription not found for customer', {
        customerId,
      });
      return;
    }

    const status = this.mapStripeStatusToPrisma(subscription.status);
    const priceId = subscription.items.data[0]?.price.id;
    const productId = subscription.items.data[0]?.price.product as string;

    await this.prisma.subscription.update({
      where: { stripeCustomerId: customerId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeProductId: productId,
        status,
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000,
        ),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
        trialEnd: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
      },
    });

    await this.prisma.stripeWebhookLog.update({
      where: { id: webhookLogId },
      data: {
        userId: existingSubscription.userId,
        subscriptionId: subscription.id,
        customerId,
      },
    });

    this.logger.info(
      `Subscription updated for user ${existingSubscription.userId}, subscription ID: ${subscription.id}, status: ${status}`,
    );
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
    webhookLogId: string,
  ): Promise<void> {
    const customerId = subscription.customer as string;

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!existingSubscription) {
      return;
    }

    await this.prisma.subscription.update({
      where: { stripeCustomerId: customerId },
      data: {
        status: SubscriptionStatus.CANCELED,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeProductId: null,
        canceledAt: new Date(),
      },
    });

    await this.prisma.stripeWebhookLog.update({
      where: { id: webhookLogId },
      data: {
        userId: existingSubscription.userId,
        subscriptionId: subscription.id,
        customerId,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: existingSubscription.userId },
    });

    if (user) {
      await this.mailService.sendSubscriptionCanceledEmail(
        user.email,
        user.username,
      );
    }

    this.logger.info(
      `Subscription deleted for user ${existingSubscription.userId}, subscription ID: ${subscription.id}`,
    );
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
    webhookLogId: string,
  ): Promise<void> {
    const customerId = invoice.customer as string;

    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!subscription) {
      return;
    }

    await this.prisma.subscription.update({
      where: { stripeCustomerId: customerId },
      data: {
        lastPaymentAmount: invoice.amount_paid,
        lastPaymentDate: new Date(),
        nextPaymentDate: invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000)
          : null,
      },
    });

    await this.prisma.stripeWebhookLog.update({
      where: { id: webhookLogId },
      data: {
        userId: subscription.userId,
        customerId,
      },
    });

    this.logger.info(
      `Invoice payment succeeded for user ${subscription.userId}, invoice ID: ${invoice.id}, amount: ${invoice.amount_paid}`,
    );
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
    webhookLogId: string,
  ): Promise<void> {
    const customerId = invoice.customer as string;

    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!subscription) {
      return;
    }

    await this.prisma.subscription.update({
      where: { stripeCustomerId: customerId },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    });

    await this.prisma.stripeWebhookLog.update({
      where: { id: webhookLogId },
      data: {
        userId: subscription.userId,
        customerId,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: subscription.userId },
    });

    if (user) {
      await this.mailService.sendPaymentFailedEmail(user.email, user.username);
    }

    this.logger.info(
      `Invoice payment failed for user ${subscription.userId}, invoice ID: ${invoice.id}`,
    );
  }

  private mapStripeStatusToPrisma(
    stripeStatus: Stripe.Subscription.Status,
  ): SubscriptionStatus {
    const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.INCOMPLETE,
      incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
      past_due: SubscriptionStatus.PAST_DUE,
      trialing: SubscriptionStatus.TRIALING,
      unpaid: SubscriptionStatus.UNPAID,
      paused: SubscriptionStatus.PAUSED,
    };

    return statusMap[stripeStatus] || SubscriptionStatus.FREE;
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    return subscription?.status || SubscriptionStatus.FREE;
  }

  async isUserPremium(userId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return false;
    }

    return (
      subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.TRIALING
    );
  }

  getPricingPlans(): any[] {
    const starterPriceId = this.configService.get('STRIPE_STARTER_PRICE_ID');
    const professionalPriceId = this.configService.get(
      'STRIPE_PROFESSIONAL_PRICE_ID',
    );
    const enterprisePriceId = this.configService.get(
      'STRIPE_ENTERPRISE_PRICE_ID',
    );

    return [
      {
        id: 'starter',
        name: 'Starter',
        price: '$9',
        priceAmount: 900,
        period: 'per month',
        description: 'Perfect for small teams getting started',
        features: [
          'Up to 5 team members',
          '10GB storage',
          'Basic analytics',
          'Email support',
          'Mobile app access',
        ],
        cta: 'Start Free Trial',
        popular: false,
        stripePriceId: starterPriceId,
      },
      {
        id: 'professional',
        name: 'Professional',
        price: '$29',
        priceAmount: 2900,
        period: 'per month',
        description: 'Ideal for growing businesses',
        features: [
          'Up to 25 team members',
          '100GB storage',
          'Advanced analytics',
          'Priority support',
          'Mobile app access',
          'Custom integrations',
          'Advanced security',
        ],
        cta: 'Start Free Trial',
        popular: true,
        stripePriceId: professionalPriceId,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$99',
        priceAmount: 9900,
        period: 'per month',
        description: 'For large organizations with advanced needs',
        features: [
          'Unlimited team members',
          '1TB storage',
          'Enterprise analytics',
          '24/7 priority support',
          'Mobile app access',
          'Custom integrations',
          'Enterprise security',
          'SSO integration',
          'Dedicated account manager',
        ],
        cta: 'Contact Sales',
        popular: false,
        stripePriceId: enterprisePriceId,
      },
    ];
  }

  async syncProducts(): Promise<void> {
    try {
      const products = await this.stripe.products.list({
        active: true,
        expand: ['data.default_price'],
      });

      for (const product of products.data) {
        const defaultPrice = product.default_price as Stripe.Price;

        if (!defaultPrice || defaultPrice.type !== 'recurring') {
          continue;
        }

        const existingProduct = await this.prisma.product.findUnique({
          where: { stripeProductId: product.id },
        });

        const productData = {
          stripeProductId: product.id,
          stripePriceId: defaultPrice.id,
          name: product.name,
          description: product.description,
          features: product.metadata.features
            ? product.metadata.features.split(',')
            : [],
          price: defaultPrice.unit_amount || 0,
          currency: defaultPrice.currency,
          interval:
            defaultPrice.recurring?.interval === 'year'
              ? BillingInterval.YEARLY
              : BillingInterval.MONTHLY,
          intervalCount: defaultPrice.recurring?.interval_count || 1,
          maxProjects: product.metadata.maxProjects
            ? parseInt(product.metadata.maxProjects)
            : null,
          maxUsersPerProject: product.metadata.maxUsersPerProject
            ? parseInt(product.metadata.maxUsersPerProject)
            : null,
          maxStorage: product.metadata.maxStorage
            ? parseInt(product.metadata.maxStorage)
            : null,
          hasAnalytics: product.metadata.hasAnalytics === 'true',
          hasPrioritySupport: product.metadata.hasPrioritySupport === 'true',
          hasCustomDomain: product.metadata.hasCustomDomain === 'true',
          hasApiAccess: product.metadata.hasApiAccess === 'true',
          displayOrder: product.metadata.displayOrder
            ? parseInt(product.metadata.displayOrder)
            : 0,
          isActive: product.active,
          isPopular: product.metadata.isPopular === 'true',
        };

        if (existingProduct) {
          await this.prisma.product.update({
            where: { id: existingProduct.id },
            data: productData,
          });
        } else {
          await this.prisma.product.create({
            data: productData as any,
          });
        }
      }

      this.logger.info(
        `Products synced successfully, count: ${products.data.length}`,
      );
    } catch (error) {
      this.logger.error('Failed to sync products', error);
      throw error;
    }
  }
}
