import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

/**
 * JWT payload interface
 * 
 * @interface JwtPayload
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT Strategy for validating JWT tokens
 * 
 * This strategy extracts JWT tokens from the Authorization header
 * and validates them against the configured secret. It also fetches
 * the user from the database to ensure the user still exists.
 * 
 * @class JwtStrategy
 * @extends PassportStrategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validates the JWT payload and returns user information
   * 
   * @param payload - The JWT payload containing user information
   * @returns Promise<User> - The validated user object
   * @throws UnauthorizedException - If user is not found or invalid
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}