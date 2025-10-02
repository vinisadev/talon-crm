import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Organizations Module
 * 
 * This module provides organization management functionality including
 * creation, retrieval, and management of organizations in the system.
 * 
 * @module OrganizationsModule
 */
@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, PrismaService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
