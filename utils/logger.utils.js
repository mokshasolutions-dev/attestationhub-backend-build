"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestLogger = createRequestLogger;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
/**
 * Sensitive fields that should be masked in logs
 */
const SENSITIVE_FIELDS = [
    'password',
    'secret',
    'token',
    'authorization',
    'apiKey',
    'api_key',
    'clientSecret',
    'client_secret',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'creditCard',
    'ssn',
    'socialSecurity',
];
/**
 * Mask sensitive data in objects for logging
 */
const MAX_LOG_DEPTH = 5;
/**
 * Mask sensitive data in objects for logging
 * Uses depth limiting to avoid performance issues
 */
function maskSensitiveData(obj, seen = new WeakSet(), depth = 0) {
    if (obj === null || obj === undefined)
        return obj;
    if (typeof obj !== 'object')
        return obj;
    // Depth guard
    if (depth > MAX_LOG_DEPTH) {
        return '[Truncated]';
    }
    // Circular reference guard
    if (seen.has(obj)) {
        return '[Circular]';
    }
    seen.add(obj);
    if (Array.isArray(obj)) {
        return obj.map(item => maskSensitiveData(item, seen, depth + 1));
    }
    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));
        if (isSensitive && typeof value === 'string') {
            masked[key] = '[REDACTED]';
        }
        else if (typeof value === 'object' && value !== null) {
            masked[key] = maskSensitiveData(value, seen, depth + 1);
        }
        else {
            masked[key] = value;
        }
    }
    return masked;
}
/**
 * Custom format for masking sensitive data
 */
const maskFormat = winston_1.default.format((info) => {
    if (info['data']) {
        info['data'] = maskSensitiveData(info['data']);
    }
    if (info['meta']) {
        info['meta'] = maskSensitiveData(info['meta']);
    }
    return info;
});
/**
 * Create Winston logger instance
 */
const logger = winston_1.default.createLogger({
    level: config_1.Config.LOG_LEVEL,
    defaultMeta: {
        service: 'attestation-service',
        tenantId: config_1.Config.TENANT_ID,
    },
    transports: [
        new winston_1.default.transports.File({
            level: 'info',
            dirname: 'logs',
            filename: 'app.log',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), maskFormat(), winston_1.default.format.json()),
            silent: config_1.Config.NODE_ENV === 'test',
        }),
        new winston_1.default.transports.File({
            level: 'error',
            dirname: 'logs',
            filename: 'error.log',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston_1.default.format.errors({ stack: true }), maskFormat(), winston_1.default.format.json()),
            silent: config_1.Config.NODE_ENV === 'test',
        }),
        new winston_1.default.transports.Console({
            level: config_1.Config.LOG_LEVEL,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston_1.default.format.colorize(), maskFormat(), config_1.Config.LOG_FORMAT === 'json'
                ? winston_1.default.format.json()
                : winston_1.default.format.simple()),
            silent: config_1.Config.NODE_ENV === 'test',
        }),
    ],
});
/**
 * Create child logger with request context
 */
function createRequestLogger(requestId, userId) {
    return logger.child({
        requestId,
        userId: userId ?? 'anonymous',
    });
}
exports.default = logger;
//# sourceMappingURL=logger.utils.js.map