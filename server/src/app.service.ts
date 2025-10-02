import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthCheck(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
