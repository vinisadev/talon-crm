import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { RegisterDto, LoginDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Register request DTO for Swagger documentation
 */
class RegisterRequestDto {
  email: string;
  password: string;
  name?: string;
  organizationId: string;
}

/**
 * Login request DTO for Swagger documentation
 */
class LoginRequestDto {
  email: string;
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
    description: 'Creates a new user account and returns a JWT access token',
  })
  @ApiBody({ type: RegisterRequestDto })
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
  @ApiBody({ type: LoginRequestDto })
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