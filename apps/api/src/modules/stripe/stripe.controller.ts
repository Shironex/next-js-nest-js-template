import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreatePortalSessionDto } from './dto/create-portal-session.dto';
import { AuthRequest } from '../../common/interfaces/auth-request.interface';
import { ApiResponseDto } from '../../common/interfaces/api-response.interface';
import { User } from '../../../generated/prisma';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('stripe')
@Controller('stripe')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout-session')
  @ApiOperation({ summary: 'Create a Stripe checkout session' })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCheckoutSession(
    @CurrentUser() user: User,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<ApiResponseDto<{ sessionId: string; url: string }>> {
    const logger = new Logger('StripeController');

    try {
      logger.log(`[DEBUG] Controller received request`, {
        userId: user?.id,
        userEmail: user?.email,
        dto: {
          priceId: dto.priceId,
          successUrl: dto.successUrl,
          cancelUrl: dto.cancelUrl,
        },
      });

      if (!user || !user.id) {
        logger.error('[DEBUG] Invalid user object received', { user });
        throw new Error('Invalid user authentication');
      }

      const session = await this.stripeService.createCheckoutSession(
        user.id,
        dto.priceId,
        dto.successUrl,
        dto.cancelUrl,
      );

      logger.log(`[DEBUG] Successfully created checkout session`, {
        userId: user.id,
        sessionId: session.id,
        sessionUrl: session.url,
      });

      return {
        success: true,
        data: {
          sessionId: session.id,
          url: session.url || '',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('[DEBUG] Controller error occurred', {
        userId: user?.id,
        errorMessage: error.message,
        errorStack: error.stack,
        dto: {
          priceId: dto?.priceId,
          successUrl: dto?.successUrl,
          cancelUrl: dto?.cancelUrl,
        },
      });

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to create checkout session',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('portal-session')
  @ApiOperation({ summary: 'Create a Stripe customer portal session' })
  @ApiResponse({
    status: 201,
    description: 'Portal session created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPortalSession(
    @CurrentUser() user: User,
    @Body() dto: CreatePortalSessionDto,
  ): Promise<ApiResponseDto<{ url: string }>> {
    const logger = new Logger('StripeController');

    try {
      logger.log(`[DEBUG] Portal session request received`, {
        userId: user?.id,
        userEmail: user?.email,
        dto: {
          returnUrl: dto.returnUrl,
        },
      });

      if (!user || !user.id) {
        logger.error(
          '[DEBUG] Invalid user object received for portal session',
          { user },
        );
        throw new Error('Invalid user authentication');
      }

      const session = await this.stripeService.createPortalSession(
        user.id,
        dto.returnUrl,
      );

      logger.log(`[DEBUG] Successfully created portal session`, {
        userId: user.id,
        sessionUrl: session.url,
      });

      return {
        success: true,
        data: {
          url: session.url,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('[DEBUG] Portal session error occurred', {
        userId: user?.id,
        errorMessage: error.message,
        errorStack: error.stack,
        dto: {
          returnUrl: dto?.returnUrl,
        },
      });

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to create portal session',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('cancel-subscription')
  @ApiOperation({ summary: 'Cancel the current subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelSubscription(
    @CurrentUser() user: User,
  ): Promise<ApiResponseDto<{ message: string }>> {
    try {
      await this.stripeService.cancelSubscription(user.id);

      return {
        success: true,
        data: {
          message:
            'Subscription will be canceled at the end of the billing period',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to cancel subscription',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('subscription-status')
  @ApiOperation({ summary: 'Get current subscription status' })
  @ApiResponse({
    status: 200,
    description: 'Subscription status retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubscriptionStatus(
    @CurrentUser() user: User,
  ): Promise<ApiResponseDto<{ status: string; isPremium: boolean }>> {
    try {
      const status = await this.stripeService.getSubscriptionStatus(user.id);
      const isPremium = await this.stripeService.isUserPremium(user.id);

      return {
        success: true,
        data: {
          status,
          isPremium,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to get subscription status',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('pricing-plans')
  @Public()
  @ApiOperation({ summary: 'Get available pricing plans' })
  @ApiResponse({
    status: 200,
    description: 'Pricing plans retrieved successfully',
  })
  getPricingPlans(): ApiResponseDto<any[]> {
    try {
      const pricingPlans = this.stripeService.getPricingPlans();

      return {
        success: true,
        data: pricingPlans,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to get pricing plans',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('sync-products')
  @ApiOperation({ summary: 'Sync products from Stripe (Admin only)' })
  @ApiResponse({ status: 200, description: 'Products synced successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async syncProducts(
    @Req() req: AuthRequest,
  ): Promise<ApiResponseDto<{ message: string }>> {
    if (req.user.role !== 'ADMIN') {
      throw new HttpException(
        {
          success: false,
          error: 'Only admins can sync products',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      await this.stripeService.syncProducts();

      return {
        success: true,
        data: {
          message: 'Products synced successfully',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to sync products',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
