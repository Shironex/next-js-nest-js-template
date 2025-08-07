import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AppService } from './app.service';
import { CustomLogger } from './modules/logger/logger.service';
import { LogRequest } from './common/decorators/log.decorator';
import {
  ApiSuccessResponseDto,
  ApiErrorResponseDto,
} from './common/dto/api-response.dto';

// Test DTO for validation example
class TestUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@ApiTags('General')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext('AppController');
  }

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Welcome message retrieved successfully',
    type: ApiSuccessResponseDto,
  })
  @LogRequest({ logRequest: true, logResponse: true })
  getHello(): string {
    this.logger.info('Processing getHello request');
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
    type: ApiSuccessResponseDto,
  })
  @LogRequest()
  getHealth() {
    this.logger.info('Health check requested');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Post('test-validation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Test validation and response formatting' })
  @ApiResponse({
    status: 201,
    description: 'User data processed successfully',
    type: ApiSuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ApiErrorResponseDto,
  })
  @LogRequest({ logRequest: true, logResponse: true, logBody: true })
  testValidation(@Body() userData: TestUserDto) {
    this.logger.info('Processing test validation request', { userData });
    return {
      message: 'User data processed successfully',
      processedData: userData,
      processedAt: new Date().toISOString(),
    };
  }
}
