import { Request, Response, NextFunction } from 'express';
/**
 * JWT Authentication middleware (COOKIE BASED)
 * Validates JWT from HTTPOnly cookie
 */
export declare function authenticateJWT(req: Request, res: Response, next: NextFunction): void;
/**
 * Role-based authorization middleware
 */
export declare function requireRoles(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Generate JWT token (USED ONLY BY SSO / LOGIN)
 */
export declare function generateToken(userId: string, tenantId: string, roles: string[]): string;
//# sourceMappingURL=auth.middleware.d.ts.map