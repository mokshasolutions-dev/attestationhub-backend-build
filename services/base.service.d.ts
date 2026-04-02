import logger from '../utils/logger.utils';
/**
 * Base Service - Abstract base class for all services
 * Provides logging, caching, retries, and resilience
 */
export declare abstract class BaseService {
    protected readonly serviceName: string;
    protected readonly logger: typeof logger;
    /**
     * Circuit breaker (per service instance)
     */
    private circuitBreaker;
    /**
     * Circuit breaker tuning
     */
    private readonly FAILURE_THRESHOLD;
    private readonly OPEN_TIMEOUT_MS;
    constructor(serviceName: string);
    /**
     * Create a request-scoped logger
     */
    protected createRequestLogger(requestId: string, userId?: string): import("winston").Logger;
    /**
     * Get cached value or fetch from source
     */
    protected getCachedOrFetch<T>(cacheKey: string, fetchFn: () => Promise<T>, ttlSeconds?: number): Promise<T>;
    /**
     * Invalidate cache entries matching pattern
     */
    protected invalidateCache(pattern: string): Promise<void>;
    /**
     * Wrap async operation with timing and logging
     */
    protected withTiming<T>(operation: string, fn: () => Promise<T>, requestId?: string): Promise<T>;
    private isCircuitOpen;
    private recordSuccess;
    private recordFailure;
    /**
     * Retry an operation with exponential backoff and circuit breaker
     */
    protected withRetry<T>(fn: () => Promise<T>, options?: {
        maxRetries?: number;
        baseDelayMs?: number;
        maxDelayMs?: number;
        retryCondition?: (error: unknown) => boolean;
    }): Promise<T>;
}
//# sourceMappingURL=base.service.d.ts.map