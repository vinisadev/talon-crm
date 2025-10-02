import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

/**
 * Contact creation request DTO
 */
class CreateContactDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
}

/**
 * Contact response DTO
 */
class ContactResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

/**
 * Contacts Controller
 * 
 * This controller demonstrates how to use JWT authentication to protect routes.
 * It shows both basic authentication and role-based access control.
 * 
 * @class ContactsController
 */
@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ContactsController {
  constructor() {}

  /**
   * Get all contacts for the authenticated user's organization
   * 
   * Retrieves all contacts that belong to the authenticated user's organization.
   * The response is automatically filtered based on the user's organization ID
   * from their JWT token.
   * 
   * @param req - Express request object containing user information from JWT
   * @returns Promise<{message: string, user: UserDto, organizationId: string}> - Success response with user info
   * 
   * @example
   * GET /contacts
   * Authorization: Bearer <jwt_token>
   * 
   * Response:
   * {
   *   "message": "Contacts retrieved successfully",
   *   "user": {
   *     "id": "user_123",
   *     "email": "user@example.com",
   *     "name": "John Doe",
   *     "role": "USER",
   *     "organizationId": "org_456"
   *   },
   *   "organizationId": "org_456"
   * }
   */
  @Get()
  @ApiOperation({
    summary: 'Get all contacts',
    description: 'Returns all contacts for the authenticated user organization. Results are automatically filtered by organization ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Contacts retrieved successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            email: { type: 'string', description: 'User email' },
            name: { type: 'string', description: 'User name', nullable: true },
            role: { type: 'string', description: 'User role', enum: ['ADMIN', 'USER'] },
            organizationId: { type: 'string', description: 'Organization ID' },
          }
        },
        organizationId: { type: 'string', description: 'Organization ID' },
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getContacts(@Request() req) {
    // In a real implementation, you would fetch contacts from the database
    // filtered by the user's organizationId
    return {
      message: 'Contacts retrieved successfully',
      user: req.user,
      organizationId: req.user.organizationId,
    };
  }

  /**
   * Create a new contact (Admin only)
   * 
   * Creates a new contact in the system. This endpoint is restricted to users with
   * ADMIN role. The contact will be automatically associated with the authenticated
   * user's organization.
   * 
   * @param req - Express request object containing user information from JWT
   * @param contactData - Contact creation data
   * @returns Promise<{message: string, contact: CreateContactDto, createdBy: string}> - Created contact response
   * 
   * @example
   * POST /contacts
   * Authorization: Bearer <jwt_token>
   * Content-Type: application/json
   * 
   * Request Body:
   * {
   *   "firstName": "John",
   *   "lastName": "Doe",
   *   "email": "john.doe@example.com",
   *   "phone": "+1234567890",
   *   "company": "Acme Corp"
   * }
   * 
   * Response:
   * {
   *   "message": "Contact created successfully",
   *   "contact": {
   *     "firstName": "John",
   *     "lastName": "Doe",
   *     "email": "john.doe@example.com",
   *     "phone": "+1234567890",
   *     "company": "Acme Corp"
   *   },
   *   "createdBy": "admin@example.com"
   * }

   */
  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Create a new contact',
    description: 'Creates a new contact in the system. Requires ADMIN role. Contact is automatically associated with the user organization.',
  })
  @ApiBody({
    type: CreateContactDto,
    description: 'Contact creation data',
    examples: {
      example1: {
        summary: 'Basic contact',
        description: 'Create a contact with minimal information',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      },
      example2: {
        summary: 'Full contact',
        description: 'Create a contact with all available fields',
        value: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567890',
          company: 'Example Inc',
        },
      },
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Contact created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Contact created successfully' },
        contact: {
          type: 'object',
          properties: {
            firstName: { type: 'string', description: 'Contact first name' },
            lastName: { type: 'string', description: 'Contact last name' },
            email: { type: 'string', description: 'Contact email address', nullable: true },
            phone: { type: 'string', description: 'Contact phone number', nullable: true },
            company: { type: 'string', description: 'Contact company', nullable: true },
          },
        },
        createdBy: { type: 'string', description: 'Email of the user who created the contact' },
      },
    },

  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid contact data provided',
  })
  async createContext(@Request() req, @Body() contactData: CreateContactDto) {
    // In a real implementation, you would create the contact in the database
    return {
      message: 'Contact created successfully',
      contact: contactData,
      createdBy: req.user.email,
    };
  }
}