import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './jwt.strategy';

/**
 * User registration data interface
 * 
 * @interface RegisterDto
 */
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
  organizationId?: string;
  organizationName?: string;
}

/**
 * User login data interface
 * 
 * @interface LoginDto
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Authentication response interface
 * 
 * @interface AuthResponse
 */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    organizationId: string;
  };
}

/**
 * Authentication Service
 * 
 * This service handles user authentication, registration, and JWT token management.
 * It provides methods for user registration, login, password hashing, and token generation.
 * 
 * @class AuthService
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private organizationsService: OrganizationsService,
  ) {}

  /**
   * Registers a new user
   * 
   * @param registerDto - User registration data
   * @returns Promise<AuthResponse> - Authentication response with token and user data
   * @throws ConflictException - If email already exists
   * @throws BadRequestException - If organization doesn't exist or invalid data provided
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name, organizationId, organizationName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let finalOrganizationId: string;

    // Handle organization - either use existing or create new one
    if (organizationId) {
      // Use existing organization
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new BadRequestException('Organization not found');
      }
      finalOrganizationId = organizationId;
    } else if (organizationName) {
      // Create new organization first
      const newOrganization = await this.prisma.organization.create({
        data: {
          name: organizationName,
        },
      });
      finalOrganizationId = newOrganization.id;

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user with ADMIN role and the new organization
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: 'ADMIN', // User who creates organization gets ADMIN role
          organizationId: finalOrganizationId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate JWT token
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        },
      };
    } else {
      throw new BadRequestException('Either organizationId or organizationName must be provided');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        organizationId: finalOrganizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  /**
   * Authenticates a user and returns JWT token
   * 
   * @param loginDto - User login data
   * @returns Promise<AuthResponse> - Authentication response with token and user data
   * @throws UnauthorizedException - If credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  /**
   * Validates a user by ID
   * 
   * @param userId - User ID to validate
   * @returns Promise<User | null> - User object if found, null otherwise
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Gets user profile by ID
   * 
   * @param userId - User ID
   * @returns Promise<User | null> - User profile if found, null otherwise
   */
  async getProfile(userId: string) {
    return this.validateUser(userId);
  }
}