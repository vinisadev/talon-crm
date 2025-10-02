import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import type { CreateOrganizationDto, OrganizationResponse } from './organizations.service';

/**
 * Create organization request DTO
 */
class CreateOrganizationRequestDto {
  /**
   * Organization name (must be unique)
   * @example Acme Corporation
   */
  name: string;
}

/**
 * Update organization request DTO
 */
class UpdateOrganizationRequestDto {
  /**
   * Organization name (must be unique)
   * @example Acme Corporation Inc.
   */
  name?: string;
}

/**
 * Organization Controller
 * 
 * This controller provides REST API endpoints for organization management including
 * creation, retrieval, updating, and deletion of organizations.
 * 
 * @class OrganizationsController
 */
@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * Create a new organization
   * 
   * Creates a new organization in the system. Organizations are required before
   * users can register, as each user must belong to an organization.
   * 
   * @param createOrganizationDto - Organization creation data
   * @returns Promise<OrganizationResponse> - Created organization with metadata
   * 
   * @example
   * POST /organizations
   * Content-Type: application/json
   * 
   * Request Body:
   * {
   *   "name": "Acme Corporation"
   * }
   * 
   * Response:
   * {
   *   "id": "org_123456789",
   *   "name": "Acme Corporation",
   *   "createdAt": "2024-01-01T00:00:00.000Z",
   *   "updatedAt": "2024-01-01T00:00:00.000Z",
   *   "userCount": 0
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new organization',
    description: 'Creates a new organization in the system. If a creator user ID is provided, that user will automatically be assigned ADMIN role and associated with the organization.',
  })
  @ApiBody({
    type: CreateOrganizationRequestDto,
    description: 'Organization creation data',
    examples: {
      example1: {
        summary: 'Basic organization',
        description: 'Create an organization with minimal information',
        value: {
          name: 'Acme Corporation',
        },
      },
      example2: {
        summary: 'Tech company',
        description: 'Create a technology company organization',
        value: {
          name: 'Tech Solutions Inc.',
        }
      },
      example3: {
        summary: 'Startup organization',
        description: 'Create a startup organization',
        value: {
          name: 'StartupXYZ',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Organization ID' },
        name: { type: 'string', description: 'Organization name' },
        createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
        updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
        userCount: { type: 'number', description: 'Number of users in the organization' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Organization with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid organization data provided',
  })
  async createOrganization(@Body() createOrganizationDto: CreateOrganizationDto): Promise<OrganizationResponse> {
    return this.organizationsService.createOrganization(createOrganizationDto);
  }
  
  /**
   * Get all organizations
   * 
   * Retrieves a list of all organizations in the system with their metadata.
   * 
   * @returns Promise<OrganizationResponse[]> - List of all organizations
   * 
   * @example
   * GET /organizations
   * 
   * Response:
   * [
   *   {
   *     "id": "org_123456789",
   *     "name": "Acme Corporation",
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T00:00:00.000Z",
   *     "userCount": 5
   *   }
   * ]
   */
  @Get()
  @ApiOperation({
    summary: 'Get all organizations',
    description: 'Retrieves a list of all organizations in the system with their metadata.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Organization ID' },
          name: { type: 'string', description: 'Organization name' },
          description: { type: 'string', description: 'Organization description', nullable: true },
          createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
          userCount: { type: 'number', description: 'Number of users in the organization' },
        },
      },
    },
  })
  async getAllOrganizations(): Promise<OrganizationResponse[]> {
    return this.organizationsService.getAllOrganizations();
  }

  /**
   * Get organization by ID
   * 
   * Retrieves a specific organization by its ID with metadata.
   * 
   * @param id - Organization ID
   * @returns Promise<OrganizationResponse> - Organization data with metadata
   * 
   * @example
   * GET /organizations/org_123456789
   * 
   * Response:
   * {
   *   "id": "org_123456789",
   *   "name": "Acme Corporation",
   *   "description": "A leading technology company",
   *   "createdAt": "2024-01-01T00:00:00.000Z",
   *   "updatedAt": "2024-01-01T00:00:00.000Z",
   *   "userCount": 5
   * }
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get organization by ID',
    description: 'Retrieves a specific organization by its ID with metadata.',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: 'org_123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Organization ID' },
        name: { type: 'string', description: 'Organization name' },
        createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
        updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
        userCount: { type: 'number', description: 'Number of users in the organization' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
  })
  async getOrganizationById(@Param('id') id: string): Promise<OrganizationResponse> {
    return this.organizationsService.getOrganizationById(id);
  }

  /**
   * Update organization
   * 
   * Updates an existing organization's information.
   * 
   * @param id - Organization ID
   * @param updateData - Organization update data
   * @returns Promise<OrganizationResponse> - Updated organization data
   * 
   * @example
   * PUT /organizations/org_123456789
   * Content-Type: application/json
   * 
   * Request Body:
   * {
   *   "name": "Acme Corporation Inc."
   * }
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update organization',
    description: 'Updates an existing organization information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: 'org_123456789',
  })
  @ApiBody({
    type: UpdateOrganizationRequestDto,
    description: 'Organization update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Organization with this name already exists',
  })
  async updateOrganization(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateOrganizationDto>
  ): Promise<OrganizationResponse> {
    return this.organizationsService.updateOrganization(id, updateData);
  }

  /**
   * Delete organization
   * 
   * Deletes an organization. The organization must not have any users.
   * 
   * @param id - Organization ID
   * @returns Promise<{message: string}> - Deletion confirmation
   * 
   * @example
   * DELETE /organizations/org_123456789
   * 
   * Response:
   * {
   *   "message": "Organization deleted successfully"
   * }
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete organization',
    description: 'Deletes an organization. The organization must not have any users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: 'org_123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Organization deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete organization with existing users',
  })
  async deleteOrganization(@Param('id') id: string): Promise<{ message: string }> {
    return this.organizationsService.deleteOrganization(id);
  }
}