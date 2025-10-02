import { Injectable } from '@nestjs/common';
import { HealthCheckDto } from './dto/health-check.dto';

@Injectable()
export class AppService {
  getHealthCheck(): HealthCheckDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
