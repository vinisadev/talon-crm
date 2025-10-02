import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { RegisterDto, LoginDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Register request DTO for Swagger documentation
 */
class RegisterRequestDto {
  /**
   * User's email address (must be unique)
   * @example john.doe@example.com
   */
  email: string;

  /**
   * User's password (minimum 8 characters, should include letters, numbers, and special characters)
   * @example SecurePassword123!
   */
  password: string;

  /**
   * User's full name (optional)
   * @example John Doe
   */
  name?: string;
  
  /**
   * Organization ID that the user belongs to (optional if organizationName is provided)
   * @example org_123456789
   */
  organizationId?: string;

  /**
   * Organization name to create (optional if organizationId is provided)
   * @example Acme Corporation
   */
  organizationName?: string;
}

/**
 * Login request DTO for Swagger documentation
 */
class LoginRequestDto {
  /**
   * User's email address
   * @example john.doe@example.com
   */
  email: string;
  
  /**
   * User's password
   * @example SecurePassword123!
   */
  password: string;
}

/**
 * Authentication Controller
 * 
 * This controller provides REST API endpoints for user authentication including
 * registration, login, and profile management. All endpoints are well-documented
 * with Swagger/OpenAPI specifications.
 * 
 * @class AuthController
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * 
   * Creates a new user account with the provided credentials and returns
   * a JWT access token for immediate authentication.
   * 
   * @param registerDto - User registration data
   * @returns Promise<AuthResponse> - Authentication response with JWT token and user data
   * 
   * @example
   * POST /auth/register
   * {
   *   "email": "test@example.com",
   *   "password": "password123",
   *   "name": "John Doe",
   *   "organizationId": "org_1234567890"
   * }
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account and returns a JWT access token. If organizationName is provided, a new organization will be created and the user will automatically be assigned ADMIN role.',
  })
  @ApiBody({
    type: RegisterRequestDto,
    description: 'User registration data',
    examples: {
      example1: {
        summary: 'Register with existing organization',
        description: 'Register a new user with an existing organization ID',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePassword123!',
          name: 'John Doe',
          organizationId: 'org_123456789',
        },
      },
      example2: {
        summary: 'Register with new organization (becomes admin)',
        description: 'Register a new user and create a new organization. The user will automatically be assigned ADMIN role.',
        value: {
          email: 'jane.smith@company.com',
          password: 'MySecurePassword456!',
          name: 'Jane Smith',
          organizationName: 'Tech Solutions Inc.',
        },
      },
      example3: {
        summary: 'Register without name (becomes admin)',
        description: 'Register a user without providing a name and create a new organization. The user will automatically be assigned ADMIN role.',
        value: {
          email: 'admin@company.com',
          password: 'AdminPassword789!',
          organizationName: 'StartupXYZ',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            email: { type: 'string', description: 'User email' },
            name: { type: 'string', description: 'User name', nullable: true },
            role: { type: 'string', description: 'User role', enum: ['ADMIN', 'USER'] },
            organizationId: { type: 'string', description: 'Organization ID' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or organization not found'
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * 
   * Authenticates a user with email and password, returning a JWT access token
   * if credentials are valid.
   * 
   * @param loginDto - User login credentials
   * @returns Promise<AuthResponse> - Authentication response with JWT token and user data
   * 
   * @example
   * POST /auth/login
   * {
   *   "email": "user@example.com",
   *   "password": "securePassword123"
   * }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates a user with email and password, returns JWT access token',
  })
  @ApiBody({
    type: LoginRequestDto,
    description: 'User login credentials',
    examples: {
      example1: {
        summary: 'Standard user login',
        description: 'Login with email and password',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePassword123!',
        }
      },
      example2: {
        summary: 'Admin login',
        description: 'Login with email and password for admin user',
        value: {
          email: 'admin@company.com',
          password: 'AdminPassword789!',
        },
      },
    }
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            email: { type: 'string', description: 'User email' },
            name: { type: 'string', description: 'User name', nullable: true },
            role: { type: 'string', description: 'User role', enum: ['ADMIN', 'USER'] },
            organizationId: { type: 'string', description: 'Organization ID' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Get user profile
   * 
   * Returns the authenticated user's profile information. Requires a valid
   * JWT token in the Authorization header.
   * 
   * @param req - Express request object containing user information from JWT
   * @returns Promise<User> - User profile data
   * 
   * @example
   * GET /auth/profile
   * Authorization: Bearer <jwt_token>
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns the authenticated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'User ID' },
        email: { type: 'string', description: 'User email' },
        name: { type: 'string', description: 'User name', nullable: true },
        role: { type: 'string', description: 'User role', enum: ['ADMIN', 'USER'] },
        organizationId: { type: 'string', description: 'Organization ID' },
        createdAt: { type: 'string', format: 'date-time', description: 'Account creation date' },
        updatedAt: { type: 'string', format: 'date-time', description: 'Last update date' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getProfile(@Request() req) {
    return req.user;
  }

  /**
   * Validate JWT token
   * 
   * Validates the provided JWT token and returns user information if valid.
   * This endpoint can be used to check token validity without accessing user profile.
   * 
   * @param req - Express request object containing user information from JWT
   * @returns Promise<{valid: boolean, user?: User}> - Token validation result
   * 
   * @example
   * GET /auth/validate
   * Authorization: Bearer <jwt_token>
   */
  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Validate JWT token',
    description: 'Validates the JWT token and returns user information if valid',
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', description: 'Token validity status' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            email: { type: 'string', description: 'User email' },
            name: { type: 'string', description: 'User name', nullable: true },
            role: { type: 'string', description: 'User role', enum: ['ADMIN', 'USER'] },
            organizationId: { type: 'string', description: 'Organization ID' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async validateToken(@Request() req) {
    return {
      valid: true,
      user: req.user,
    };
  }
}