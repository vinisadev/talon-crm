import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

/**
 * JWT Authentication Guard
 * 
 * This guard extends the Passport JWT strategy guard and provides
 * additional functionality for role-based access control.
 * 
 * @class JwtAuthGuard
 * @extends AuthGuard
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if the request should be allowed to proceed
   * 
   * @param context - The execution context containing request information
   * @returns Promise<boolean> - True if request should be allowed
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Call the parent canActivate method to validate JWT
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    // Get the required roles from the route metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the user from the request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user has required role
    return requiredRoles.some((role) => user.role === role);
  }
}