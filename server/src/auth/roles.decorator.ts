import { SetMetadata } from '@nestjs/common';

/**
 * Roles metadata key for storing role requirements
 */
export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 * 
 * This decorator is used to specify which roles are required to access
 * a particular route or controller method. It works in conjunction with
 * the JWTAuthGuard to provide role-based access control.
 * 
 * @param roles - Array of roles that are allowed to use the resource
 * @returns Decorator function
 * 
 * @example
 * @Roles('ADMIN')
 * @Get('admin-only')
 * adminOnlyRoute() {
 *   return 'Only admins can access this route';
 * }
 * 
 * @Roles('ADMIN', 'USER')
 * @Get('user-or-admin')
 * userOrAdminRoute() {
 *   return 'Users and admins can access this route';
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);