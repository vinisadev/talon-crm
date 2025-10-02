import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthCheckDto } from './dto/health-check.dto';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health Check',
    description: 'Returns the current health status of the API server including uptime and timestamp'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API is healthy and running',
    type: HealthCheckDto
  })
  getHealthCheck(): HealthCheckDto {
    return this.appService.getHealthCheck();
  }
}
