"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../../config"));
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
class RedisService {
    client = null;
    ready = false;
    constructor() {
        if (!config_1.default.REDIS_ENABLED) {
            logger_utils_1.default.warn('Redis disabled via config');
            return;
        }
        this.client = new ioredis_1.default({
            host: config_1.default.REDIS_HOST,
            port: config_1.default.REDIS_PORT,
            connectTimeout: 3000,
            enableOfflineQueue: false,
            maxRetriesPerRequest: 1,
            retryStrategy: (times) => (times > 2 ? null : 500),
        });
        this.client.on('ready', () => {
            this.ready = true;
            logger_utils_1.default.info('Redis ready', {
                host: config_1.default.REDIS_HOST,
                port: config_1.default.REDIS_PORT,
            });
        });
        this.client.on('end', () => {
            this.ready = false;
            logger_utils_1.default.warn('Redis connection closed');
        });
        this.client.on('error', (err) => {
            this.ready = false;
            logger_utils_1.default.warn('Redis error (ignored)', { error: err.message });
        });
    }
    /* ---------------------------
       REQUIRED BY server.ts
       --------------------------- */
    async waitForReady(timeoutMs = 5000) {
        if (!this.client || this.ready)
            return;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error('Redis connection timeout'));
            }, timeoutMs);
            const onReady = () => {
                cleanup();
                resolve();
            };
            const onError = (err) => {
                cleanup();
                reject(err);
            };
            const cleanup = () => {
                clearTimeout(timer);
                this.client?.off('ready', onReady);
                this.client?.off('error', onError);
            };
            this.client?.once('ready', onReady);
            this.client?.once('error', onError);
        });
    }
    isReady() {
        return this.ready;
    }
    async ping() {
        if (!this.client || !this.ready) {
            return { healthy: false, latencyMs: 0 };
        }
        const start = Date.now();
        try {
            await this.client.ping();
            return { healthy: true, latencyMs: Date.now() - start };
        }
        catch {
            return { healthy: false, latencyMs: Date.now() - start };
        }
    }
    async get(key) {
        if (!this.client || !this.ready)
            return null;
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            logger_utils_1.default.warn('Redis GET failed (ignored)', {
                key,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.client || !this.ready) {
            logger_utils_1.default.debug('Redis SET skipped (not ready)', { key });
            return;
        }
        try {
            const payload = JSON.stringify(value);
            if (ttlSeconds && ttlSeconds > 0) {
                await this.client.set(key, payload, 'EX', ttlSeconds);
            }
            else {
                await this.client.set(key, payload);
            }
            logger_utils_1.default.info('REDIS CACHE WRITE', {
                key,
                ttl: ttlSeconds,
            });
        }
        catch (error) {
            logger_utils_1.default.warn('Redis SET failed (ignored)', {
                key,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async del(key) {
        if (!this.client || !this.ready)
            return;
        try {
            await this.client.del(key);
            logger_utils_1.default.info('REDIS KEY DELETED', { key });
        }
        catch (error) {
            logger_utils_1.default.warn('Redis DEL failed (ignored)', {
                key,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async deletePattern(pattern) {
        if (!this.client || !this.ready)
            return;
        try {
            let cursor = '0';
            do {
                const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = nextCursor;
                if (keys.length > 0) {
                    await this.client.del(keys);
                    logger_utils_1.default.info('REDIS KEYS DELETED', {
                        pattern,
                        count: keys.length,
                    });
                }
            } while (cursor !== '0');
        }
        catch (error) {
            logger_utils_1.default.warn('Redis deletePattern failed (ignored)', {
                pattern,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async disconnect() {
        if (!this.client)
            return;
        try {
            await this.client.quit();
        }
        finally {
            this.client = null;
            this.ready = false;
            logger_utils_1.default.info('Redis disconnected');
        }
    }
}
const redisService = new RedisService();
exports.default = redisService;
//# sourceMappingURL=redis.service.js.map