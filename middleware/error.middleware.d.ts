import { Request, Response, NextFunction } from 'express';
/**
 * Custom error class with status code
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly isOperational: boolean;
    readonly details?: Record<string, unknown>;
    constructor(message: string, statusCode?: number, code?: string, isOperational?: boolean, details?: Record<string, unknown>);
}
/**
 * Not Found error
 */
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
/**
 * Validation error
 */
export declare class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Unauthorized error
 */
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
/**
 * Forbidden error
 */
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
/**
 * Request ID middleware
 * Adds unique request ID to each request
 */
export declare function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void;
/**
 * Request logging middleware
 */
export declare function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void;
/**
 * 404 handler for unmatched routes
 */
export declare function notFoundHandler(req: Request, res: Response): void;
/**
 * Global error handler middleware
 */
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void;
/**
 * Async handler wrapper to catch errors in async route handlers
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map