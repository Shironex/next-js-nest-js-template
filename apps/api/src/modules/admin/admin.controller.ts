import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminRoleGuard } from '../../common/guards/role.guard';
import { ApiResponseDto } from '../../common/interfaces/api-response.interface';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, AdminRoleGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('webhook-logs')
  @ApiOperation({ summary: 'Get webhook audit logs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Webhook logs retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of logs to retrieve',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of logs to skip',
  })
  async getWebhookLogs(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 100;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      const result = await this.adminService.getWebhookLogs(
        limitNum,
        offsetNum,
      );

      return {
        success: true,
        data: result.logs,
        meta: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to fetch webhook logs',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('webhook-logs/stats')
  @ApiOperation({ summary: 'Get webhook statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Webhook statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getWebhookStats(): Promise<ApiResponseDto<any>> {
    try {
      const stats = await this.adminService.getWebhookStats();

      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to fetch webhook statistics',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('webhook-logs/:id')
  @ApiOperation({ summary: 'Get specific webhook log details (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Webhook log retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Webhook log not found' })
  async getWebhookLogById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      const log = await this.adminService.getWebhookLogById(id);

      if (!log) {
        throw new HttpException(
          {
            success: false,
            error: 'Webhook log not found',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: log,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to fetch webhook log',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('subscription-stats')
  @ApiOperation({ summary: 'Get subscription statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSubscriptionStats(): Promise<ApiResponseDto<any>> {
    try {
      const stats = await this.adminService.getSubscriptionStats();

      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to fetch subscription statistics',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
