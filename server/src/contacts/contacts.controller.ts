import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

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
   * @param req - Express request object containing user information from JWT
   * @returns Promise<any> - List of contacts
   */
  @Get()
  @ApiOperation({
    summary: 'Get all contacts',
    description: 'Returns all contacts for the authenticated user organization',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacts retrieved successfully',
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
   * @param req - Express request object containing user information from JWT
   * @param contactData - Contact data
   * @returns Promise<any> - Created contact
   */
  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Create a new contact',
    description: 'Creates a new contact (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Contact created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async createContact(@Request() req, @Body() contactData: any) {
    // In a real implementation, you would create the contact in the database
    return {
      message: 'Contact created successfully',
      contact: contactData,
      createdBy: req.user.email,
    };
  }
}