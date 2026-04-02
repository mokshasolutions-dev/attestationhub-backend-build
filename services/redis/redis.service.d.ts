declare class RedisService {
    private client;
    private ready;
    constructor();
    waitForReady(timeoutMs?: number): Promise<void>;
    isReady(): boolean;
    ping(): Promise<{
        healthy: boolean;
        latencyMs: number;
    }>;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    deletePattern(pattern: string): Promise<void>;
    disconnect(): Promise<void>;
}
declare const redisService: RedisService;
export default redisService;
//# sourceMappingURL=redis.service.d.ts.map