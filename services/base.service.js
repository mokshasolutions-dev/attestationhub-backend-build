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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const logger_utils_1 = __importStar(require("../utils/logger.utils"));
const redis_service_1 = __importDefault(require("./redis/redis.service"));
const promises_1 = require("node:timers/promises");
/**
 * Default circuit breaker state
 */
const DEFAULT_CIRCUIT_BREAKER = {
    state: 'CLOSED',
    failureCount: 0,
    lastFailureTime: 0,
};
/**
 * Base Service - Abstract base class for all services
 * Provides logging, caching, retries, and resilience
 */
class BaseService {
    serviceName;
    logger;
    /**
     * Circuit breaker (per service instance)
     */
    circuitBreaker = {
        ...DEFAULT_CIRCUIT_BREAKER,
    };
    /**
     * Circuit breaker tuning
     */
    FAILURE_THRESHOLD = 5;
    OPEN_TIMEOUT_MS = 30_000;
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.logger = logger_utils_1.default.child({ service: serviceName });
    }
    /**
     * Create a request-scoped logger
     */
    createRequestLogger(requestId, userId) {
        return (0, logger_utils_1.createRequestLogger)(requestId, userId).child({
            service: this.serviceName,
        });
    }
    // ------------------------------------------------------------------
    // CACHE HELPERS
    // ------------------------------------------------------------------
    /**
     * Get cached value or fetch from source
     */
    async getCachedOrFetch(cacheKey, fetchFn, ttlSeconds = 300) {
        const cached = await redis_service_1.default.get(cacheKey);
        if (cached !== null) {
            this.logger.debug('Cache hit', { cacheKey });
            return cached;
        }
        this.logger.debug('Cache miss, fetching from source', { cacheKey });
        const data = await fetchFn();
        await redis_service_1.default.set(cacheKey, data, ttlSeconds);
        return data;
    }
    /**
     * Invalidate cache entries matching pattern
     */
    async invalidateCache(pattern) {
        await redis_service_1.default.deletePattern(pattern);
        this.logger.debug('Cache invalidated', { pattern });
    }
    // ------------------------------------------------------------------
    // TIMING WRAPPER
    // ------------------------------------------------------------------
    /**
     * Wrap async operation with timing and logging
     */
    async withTiming(operation, fn, requestId) {
        const startTime = Date.now();
        const log = requestId
            ? this.createRequestLogger(requestId)
            : this.logger;
        try {
            log.debug(`Starting ${operation}`);
            const result = await fn();
            log.debug(`Completed ${operation}`, {
                durationMs: Date.now() - startTime,
            });
            return result;
        }
        catch (error) {
            log.warn(`Failed ${operation}`, {
                durationMs: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    // ------------------------------------------------------------------
    // CIRCUIT BREAKER HELPERS
    // ------------------------------------------------------------------
    isCircuitOpen() {
        if (this.circuitBreaker.state !== 'OPEN') {
            return false;
        }
        const now = Date.now();
        if (now - this.circuitBreaker.lastFailureTime > this.OPEN_TIMEOUT_MS) {
            this.circuitBreaker.state = 'HALF_OPEN';
            this.logger.warn('Circuit breaker half-open, allowing test request');
            return false;
        }
        return true;
    }
    recordSuccess() {
        this.circuitBreaker = { ...DEFAULT_CIRCUIT_BREAKER };
    }
    recordFailure() {
        this.circuitBreaker.failureCount += 1;
        this.circuitBreaker.lastFailureTime = Date.now();
        if (this.circuitBreaker.failureCount >= this.FAILURE_THRESHOLD) {
            if (this.circuitBreaker.state !== 'OPEN') {
                this.circuitBreaker.state = 'OPEN';
                this.logger.error('Circuit breaker opened', {
                    failureCount: this.circuitBreaker.failureCount,
                });
            }
        }
    }
    // ------------------------------------------------------------------
    // RETRY WITH EXPONENTIAL BACKOFF + CIRCUIT BREAKER
    // ------------------------------------------------------------------
    /**
     * Retry an operation with exponential backoff and circuit breaker
     */
    async withRetry(fn, options = {}) {
        const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 30000, retryCondition = () => true, } = options;
        // Fail fast if circuit is open
        if (this.isCircuitOpen()) {
            throw new Error('Circuit breaker is OPEN. Request blocked.');
        }
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await fn();
                // SUCCESS: reset circuit breaker completely
                this.recordSuccess();
                return result;
            }
            catch (error) {
                lastError = error;
                this.recordFailure();
                if (attempt === maxRetries || !retryCondition(error)) {
                    throw error;
                }
                const delayMs = Math.min(baseDelayMs * 2 ** attempt + Math.random() * 1000, maxDelayMs);
                this.logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    delayMs,
                    circuitState: this.circuitBreaker.state,
                });
                await (0, promises_1.setTimeout)(delayMs);
            }
        }
        // Should never reach here, but required for TypeScript safety
        throw lastError;
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=base.service.js.map