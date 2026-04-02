"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
exports.validateSecurityConfig = validateSecurityConfig;
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
/**
 * Load tenant-specific environment configuration
 * Supports: .env.{NODE_ENV}, .env
 */
(0, dotenv_1.config)({
    path: path_1.default.join(__dirname, `../../.env.${process.env['NODE_ENV'] || 'development'}`),
});
// Load base .env if the specialized one doesn't exist or misses values
(0, dotenv_1.config)({ path: path_1.default.resolve(process.cwd(), '.env'), override: false });
/**
 * Get required environment variable or throw
 */
function getRequired(key) {
    const value = process.env[key];
    if (value === undefined || value === '') {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
/**
 * Get optional environment variable with default
 */
function getOptional(key, defaultValue) {
    return process.env[key] ?? defaultValue;
}
/**
 * Parse integer from environment variable
 */
function getInt(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined || value === '')
        return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${key} must be a valid integer`);
    }
    return parsed;
}
/**
 * Parse boolean from environment variable
 */
function getBool(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined || value === '')
        return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
}
/**
 * Parse comma-separated list from environment variable
 */
function getList(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined || value === '')
        return defaultValue;
    return value
        .split(',')
        .map(item => item.trim().replace(/\/$/, ''))
        .filter(Boolean);
}
function getDomain(key) {
    const value = process.env[key];
    if (!value)
        return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
/**
 * Validated and typed flat configuration object
 */
exports.Config = Object.freeze({
    PORT: getInt('PORT', 3000),
    NODE_ENV: getOptional('NODE_ENV', 'development'),
    TENANT_ID: getOptional('TENANT_ID', 'default'),
    DB_BASE_PATH: getRequired('DB_BASE_PATH'),
    IMAGE_BASE_URL: getRequired('IMAGE_BASE_URL'),
    JWT_SECRET: getRequired('JWT_SECRET'),
    API_KEY_SALT: getRequired('API_KEY_SALT'),
    BCRYPT_SALT_ROUNDS: getInt('BCRYPT_SALT_ROUNDS', 12),
    RATE_LIMIT_WINDOW_MS: getInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    RATE_LIMIT_MAX_REQUESTS: getInt('RATE_LIMIT_MAX_REQUESTS', 100),
    CORS_ALLOWED_ORIGINS: getList('CORS_ALLOWED_ORIGINS', [
        'http://localhost:3000',
    ]),
    REDIS_ENABLED: getBool('REDIS_ENABLED', false),
    REDIS_HOST: getOptional('REDIS_HOST', 'localhost'),
    REDIS_PORT: getInt('REDIS_PORT', 6379),
    REDIS_PASSWORD: getOptional('REDIS_PASSWORD', ''),
    REDIS_DB: getInt('REDIS_DB', 0),
    REDIS_TLS_ENABLED: getBool('REDIS_TLS_ENABLED', false),
    IAM_BASE_URL: getRequired('IAM_BASE_URL'),
    DASHBOARD_WORKFLOW_API: getRequired('DASHBOARD_WORKFLOW_API'),
    LIST_WORKFLOW_API: getRequired('LIST_WORKFLOW_API'),
    DETAILS_WORKFLOW_API: getRequired('DETAILS_WORKFLOW_API'),
    STAGE_WORKFLOW_API: getRequired('STAGE_WORKFLOW_API'),
    IAM_USERNAME_ENCRYPTED: getRequired('IAM_USERNAME_ENCRYPTED'),
    IAM_PASSWORD_ENCRYPTED: getRequired('IAM_PASSWORD_ENCRYPTED'),
    IAM_REQUEST_TIMEOUT_MS: getInt('IAM_REQUEST_TIMEOUT_MS', 30000),
    IAM_USE_DUMMY_DATA: getBool('IAM_USE_DUMMY_DATA', false),
    STAGE_ACTION_APPLICATION_API: getRequired('STAGE_ACTION_APPLICATION_API'),
    STAGE_ACTION_ENTITLEMENT_API: getRequired('STAGE_ACTION_ENTITLEMENT_API'),
    STAGE_ACTION_BIRTHRIGHT_API: getRequired('STAGE_ACTION_BIRTHRIGHT_API'),
    LOG_LEVEL: getOptional('LOG_LEVEL', 'info'),
    LOG_FORMAT: getOptional('LOG_FORMAT', 'json'),
    AUTH_COOKIE_DOMAIN: getDomain('AUTH_COOKIE_DOMAIN'),
    UI_REDIRECT_URL: getOptional('UI_REDIRECT_URL', '/'),
    JDBC_FILE_BASE_URL: getRequired('JDBC_FILE_BASE_URL'),
    JDBC_FILE_STORAGE_PATH: getOptional('JDBC_FILE_STORAGE_PATH', 'public/jdbc'),
    EVIDENCE_UPLOAD_STORAGE_PATH: getOptional('DECENTRALIZED_EVIDENCE_UPLOAD', 'public/evidenceupload'),
});
/**
 * Centralized security validation
 * This function MUST remain exported
 */
function validateSecurityConfig() {
    // Core secrets
    if (exports.Config.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    if (exports.Config.API_KEY_SALT.length < 16) {
        throw new Error('API_KEY_SALT must be at least 16 characters long');
    }
    // Encrypted IAM values are still secrets
    if (exports.Config.IAM_USERNAME_ENCRYPTED.length < 16) {
        throw new Error('IAM_USERNAME_ENCRYPTED must be at least 16 characters long');
    }
    if (exports.Config.IAM_PASSWORD_ENCRYPTED.length < 16) {
        throw new Error('IAM_PASSWORD_ENCRYPTED must be at least 16 characters long');
    }
    // Optional secret: validate only if provided
    if (exports.Config.REDIS_PASSWORD && exports.Config.REDIS_PASSWORD.length < 12) {
        throw new Error('REDIS_PASSWORD must be at least 12 characters long');
    }
    // Production safety checks
    if (exports.Config.NODE_ENV === 'production') {
        if (exports.Config.CORS_ALLOWED_ORIGINS.includes('*')) {
            throw new Error('Wildcard CORS origin not allowed in production');
        }
    }
}
exports.default = exports.Config;
//# sourceMappingURL=index.js.map