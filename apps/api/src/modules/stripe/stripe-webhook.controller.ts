import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  RawBodyRequest,
  Headers,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('stripe-webhook')
@Controller('stripe/webhook')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private stripe: Stripe;

  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2025-08-27.basil',
      },
    );
  }

  @Post()
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    const rawBody = req.rawBody;

    if (!rawBody) {
      this.logger.error('No raw body received in webhook');
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'No raw body received',
      });
      return;
    }

    if (!signature) {
      this.logger.error('No signature received in webhook');
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'No signature received',
      });
      return;
    }

    let event: Stripe.Event;

    try {
      const webhookSecret =
        this.configService.get('STRIPE_WEBHOOK_SECRET') || '';
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      res.status(HttpStatus.BAD_REQUEST).json({
        error: `Webhook Error: ${err.message}`,
      });
      return;
    }

    try {
      await this.stripeService.handleWebhookEvent(
        event,
        signature,
        rawBody.toString(),
      );

      res.status(HttpStatus.OK).json({ received: true });
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Error processing webhook',
      });
    }
  }
}
