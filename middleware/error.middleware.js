"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
exports.requestIdMiddleware = requestIdMiddleware;
exports.requestLoggerMiddleware = requestLoggerMiddleware;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
const uuid_1 = require("uuid");
const logger_utils_1 = __importStar(require("../utils/logger.utils"));
const config_1 = require("../config");
/**
 * Custom error class with status code
 */
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Not Found error
 */
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Validation error
 */
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', true, details);
    }
}
exports.ValidationError = ValidationError;
/**
 * Unauthorized error
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * Forbidden error
 */
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * Request ID middleware
 * Adds unique request ID to each request
 */
function requestIdMiddleware(req, res, next) {
    const requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
}
/**
 * Request logging middleware
 */
function requestLoggerMiddleware(req, res, next) {
    const startTime = Date.now();
    const requestLogger = (0, logger_utils_1.createRequestLogger)(req.requestId ?? 'unknown', req.user?.id);
    // Log incoming request
    requestLogger.info('Incoming request', {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });
    // Log response on finish
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const level = res.statusCode >= 400 ? 'warn' : 'info';
        requestLogger.log(level, 'Request completed', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs: duration,
        });
    });
    next();
}
/**
 * 404 handler for unmatched routes
 */
function notFoundHandler(req, res) {
    const response = {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
        meta: {
            requestId: req.requestId ?? 'unknown',
            timestamp: new Date().toISOString(),
            processingTimeMs: 0,
        },
    };
    res.status(404).json(response);
}
/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, _next) {
    const requestId = req.requestId ?? 'unknown';
    // Determine if this is an operational error
    const isOperational = err instanceof AppError && err.isOperational;
    // Log the error
    if (isOperational) {
        logger_utils_1.default.warn('Operational error', {
            requestId,
            error: err.message,
            code: err.code,
            statusCode: err.statusCode,
            path: req.path,
        });
    }
    else {
        logger_utils_1.default.error('Unexpected error', {
            requestId,
            error: err.message,
            stack: err.stack,
            path: req.path,
        });
    }
    // Determine status code and error details
    let statusCode = 500;
    let errorResponse = {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
    };
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorResponse = {
            code: err.code,
            message: err.message,
            details: err.details,
        };
    }
    else if (err.name === 'SyntaxError' && 'body' in err) {
        // JSON parsing error
        statusCode = 400;
        errorResponse = {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
        };
    }
    // Don't leak error details in production for non-operational errors
    if (config_1.Config.NODE_ENV === 'production' && !isOperational) {
        errorResponse = {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            requestId,
        };
    }
    // Ensure requestId is always present in the error object
    if (!errorResponse.requestId) {
        errorResponse.requestId = requestId;
    }
    const response = {
        success: false,
        error: errorResponse,
        meta: {
            requestId,
            timestamp: new Date().toISOString(),
            processingTimeMs: 0,
        },
    };
    res.status(statusCode).json(response);
}
/**
 * Async handler wrapper to catch errors in async route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=error.middleware.js.map