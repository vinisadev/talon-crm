import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({
    description: 'Current health status of the API',
    example: 'ok',
    enum: ['ok', 'error']
  })
  status: string;

  @ApiProperty({
    description: 'Current timestamp when the health check was performed',
    example: '2024-01-15T10:30:45.123Z',
    type: 'string',
    format: 'date-time'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Process uptime in seconds',
    example: 123.456,
    type: 'number'
  })
  uptime: number;
}
