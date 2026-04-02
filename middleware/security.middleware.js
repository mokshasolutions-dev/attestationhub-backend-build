"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = exports.corsMiddleware = exports.helmetMiddleware = void 0;
exports.sanitizeRequest = sanitizeRequest;
exports.securityHeaders = securityHeaders;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const jsdom_1 = require("jsdom");
const dompurify_1 = __importDefault(require("dompurify"));
const config_1 = require("../config");
const logger_utils_1 = __importDefault(require("../utils/logger.utils"));
/**
 * DOMPurify setup for server-side sanitization
 */
const window = new jsdom_1.JSDOM('').window;
const DOMPurify = (0, dompurify_1.default)(window);
/**
 * Helmet middleware for secure HTTP headers
 */
exports.helmetMiddleware = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
});
/**
 * CORS middleware with strict origin validation
 */
exports.corsMiddleware = (0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) {
            callback(null, true);
            return;
        }
        // Check for wildcard or exact match
        if (config_1.Config.CORS_ALLOWED_ORIGINS.includes('*') || config_1.Config.CORS_ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
            logger_utils_1.default.warn('CORS blocked request from origin', {
                origin,
                allowed: config_1.Config.CORS_ALLOWED_ORIGINS
            });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-API-Key'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
    maxAge: 86400, // 24 hours
});
/**
 * Rate limiting middleware
 */
exports.rateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: config_1.Config.RATE_LIMIT_WINDOW_MS,
    max: config_1.Config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
        },
    },
    // Trust proxy is enabled in app.ts, so req.ip will be correct
    // Default keyGenerator uses req.ip
    skip: (req) => {
        // Skip rate limiting for health check endpoints
        return req.path === '/api/health' || req.path === '/api/health/live';
    },
    handler: (req, res) => {
        logger_utils_1.default.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            userAgent: req.headers['user-agent'],
        });
        res.status(429).json({
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests, please try again later',
            },
        });
    },
});
/**
 * Request sanitization middleware
 */
function sanitizeRequest(req, _res, next) {
    // Sanitize query parameters
    if (req.query) {
        for (const key of Object.keys(req.query)) {
            const value = req.query[key];
            if (typeof value === 'string') {
                req.query[key] = DOMPurify.sanitize(value, {
                    ALLOWED_TAGS: [],
                    ALLOWED_ATTR: [],
                });
            }
        }
    }
    next();
}
/**
 * Security headers for API responses
 */
function securityHeaders(_req, res, next) {
    // Prevent caching of sensitive data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    // Additional security headers
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    next();
}
//# sourceMappingURL=security.middleware.js.map