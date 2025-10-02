import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Organization creation data interface
 * 
 * @interface CreateOrganizationDto
 */
export interface CreateOrganizationDto {
  name: string;
  createdByUserId?: string;
}

/**
 * Organization response interface
 * 
 * @interface OrganizationResponse
 */
export interface OrganizationResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userCount: number;
}

/**
 * Organizations Service
 * 
 * This service handles organization management including creation,
 * retrieval, and basic organization operations.
 * 
 * @class OrganizationsService
 */
@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new organization
   * 
   * @param createOrganizationDto - Organization creation data
   * @returns Promise<OrganizationResponse> - Created organization with metadata
   * @throws ConflictException - If organization name already exists
   * @throws NotFoundException - If creator user ID is provided but user doesn't exist
   */
  async createOrganization(createOrganizationDto: CreateOrganizationDto): Promise<OrganizationResponse> {
    const { name, createdByUserId } = createOrganizationDto;

    // Check if organization with this name already exists
    const existingOrganization = await this.prisma.organization.findFirst({
      where: { name },
    });

    if (existingOrganization) {
      throw new ConflictException('Organization with this name already exists');
    }

    // If a creator user IID is provided, verify the user exists
    if (createdByUserId) {
      const creator = await this.prisma.user.findUnique({
        where: { id: createdByUserId },
      });

      if (!creator) {
        throw new NotFoundException('Creator user not found');
      }
    }

    // Create organization
    const organization = await this.prisma.organization.create({
      data: {
        name,
      },
    });

    // If a creator user ID is provided, update their role to ADMIN and assign to organization
    if (createdByUserId) {
      await this.prisma.user.update({
        where: { id: createdByUserId },
        data: {
          role: 'ADMIN',
          organizationId: organization.id,
        },
      });
    }

    // Get user count for the organization
    const userCount = await this.prisma.user.count({
      where: { organizationId: organization.id },
    });

    return {
      id: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      userCount,
    };
  }

  /**
   * Gets an organization by ID
   * 
   * @param id - Organization ID
   * @returns Promise<OrganizationResponse> - Organization data with metadata
   * @throws NotFoundException - If organization not found
   */
  async getOrganizationById(id: string): Promise<OrganizationResponse> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Get user count for the organization
    const userCount = await this.prisma.user.count({
      where: { organizationId: organization.id },
    });

    return {
      id: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      userCount,
    };
  }

  /**
   * Gets all organizations
   * 
   * @returns Promise<OrganizationResponse[]> - List of all organizations
   */
  async getAllOrganizations(): Promise<OrganizationResponse[]> {
    const organizations = await this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Get user counts for all organizations
    const organizationsWithUserCounts = await Promise.all(
      organizations.map(async (org) => {
        const userCount = await this.prisma.user.count({
          where: { organizationId: org.id },
        });

        return {
          id: org.id,
          name: org.name,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
          userCount,
        };
      })
    );

    return organizationsWithUserCounts;
  }

  /**
   * Updates an organization
   * 
   * @param id - Organization ID
   * @param updateData - Organization update data
   * @returns Promise<OrganizationResponse> - Updated organization data
   * @throws NotFoundException - If organization not found
   */
  async updateOrganization(id: string, updateData: Partial<CreateOrganizationDto>): Promise<OrganizationResponse> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check for name conflicts if name is being updated
    if (updateData.name && updateData.name !== organization.name) {
      const existingOrganization = await this.prisma.organization.findFirst({
        where: {
          name: updateData.name,
          id: { not: id },
        },
      });

      if (existingOrganization) {
        throw new ConflictException('Organization with this name already exists');
      }
    }

    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: updateData,
    });

    // Get user count for the organization
    const userCount = await this.prisma.user.count({
      where: { organizationId: organization.id },
    });

    return {
      id: updatedOrganization.id,
      name: updatedOrganization.name,
      createdAt: updatedOrganization.createdAt,
      updatedAt: updatedOrganization.updatedAt,
      userCount,
    };
  }

  /**
   * Delete an organization
   * 
   * @param id - Organization ID
   * @returns Promise<{message: string}> - Deletion confirmation
   * @throws NotFoundException - If organization not found
   */
  async deleteOrganization(id: string): Promise<{ message: string }> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if organization has users
    const userCount = await this.prisma.user.count({
      where: { organizationId: id },
    });

    if (userCount > 0) {
      throw new ConflictException('Cannot delete organization with existing users. Please remove all users first.');
    }

    await this.prisma.organization.delete({
      where: { id },
    });

    return { message: 'Organization deleted successfully' };
  }
}