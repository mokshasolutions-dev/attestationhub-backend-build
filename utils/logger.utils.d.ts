import winston from 'winston';
/**
 * Create Winston logger instance
 */
declare const logger: winston.Logger;
/**
 * Create child logger with request context
 */
export declare function createRequestLogger(requestId: string, userId?: string): winston.Logger;
export default logger;
//# sourceMappingURL=logger.utils.d.ts.map