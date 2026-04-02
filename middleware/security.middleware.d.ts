import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
/**
 * Helmet middleware for secure HTTP headers
 */
export declare const helmetMiddleware: (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse, next: (err?: unknown) => void) => void;
/**
 * CORS middleware with strict origin validation
 */
export declare const corsMiddleware: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
/**
 * Rate limiting middleware
 */
export declare const rateLimitMiddleware: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Request sanitization middleware
 */
export declare function sanitizeRequest(req: Request, _res: Response, next: NextFunction): void;
/**
 * Security headers for API responses
 */
export declare function securityHeaders(_req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=security.middleware.d.ts.map