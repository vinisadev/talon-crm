import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('TalonCRM API')
    .setDescription('A comprehensive Customer Relationship Management API for managing contacts, interactions, and sales pipelines')
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Contacts', 'Contact management and customer data')
    .addTag('Interactions', 'Customer interaction tracking and history')
    .addTag('Pipelines', 'Sales pipeline and opportunity management')
    .addTag('Reports', 'Analytics and reporting functionality')
    .addTag('System', 'System health and monitoring endpoints')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.taloncrm.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
