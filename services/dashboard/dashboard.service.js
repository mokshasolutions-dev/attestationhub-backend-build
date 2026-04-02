"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = getDashboardData;
const iam_service_1 = __importDefault(require("../iam/iam.service"));
const redis_service_1 = __importDefault(require("../redis/redis.service"));
const config_1 = require("../../config");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const DASHBOARD_TTL_SECONDS = 300;
/**
 * Dashboard Data Service
 * - Filters attestation types with NO real data
 * - Redis stores only filtered snapshot
 * - SailPoint remains source of truth
 */
async function getDashboardData(owner) {
    const cacheKey = `dashboard:${owner}`;
    const start = Date.now();
    // ---------------------------------------------------
    // 1. Redis Cache (Best Effort) - SKIP if globally in dummy mode
    // ---------------------------------------------------
    if (redis_service_1.default.isReady() && !config_1.Config.IAM_USE_DUMMY_DATA) {
        const cached = await redis_service_1.default.get(cacheKey);
        if (cached) {
            const latencyMs = Date.now() - start;
            logger_utils_1.default.info('REDIS CACHE HIT', { key: cacheKey, latencyMs });
            return {
                data: cached.data,
                cache: {
                    status: 'HIT',
                    key: cacheKey,
                    latencyMs,
                    isDummy: cached.isDummy,
                },
            };
        }
        logger_utils_1.default.info('REDIS CACHE MISS', { key: cacheKey });
    }
    else {
        logger_utils_1.default.debug('Redis not ready, skipping cache', { key: cacheKey });
    }
    // ---------------------------------------------------
    // 2. Fetch from SailPoint (Source of Truth)
    // ---------------------------------------------------
    const result = await iam_service_1.default.launchAttestationStatistics(owner);
    //  NEVER mutate IAM response directly
    const filteredData = structuredClone(result.data);
    // ---------------------------------------------------
    // 3. Helper: detect meaningful top5items
    // ---------------------------------------------------
    const hasMeaningfulItems = (items) => items.some((entry) => entry &&
        typeof entry === 'object' &&
        Object.keys(entry).length > 0);
    // ---------------------------------------------------
    // 4. Filter EMPTY STANDARD attestation types
    // ---------------------------------------------------
    if (filteredData?.attributes?.responseMap) {
        for (const [type, stats] of Object.entries(filteredData.attributes.responseMap)) {
            const pending = stats?.pending ?? 0;
            const completed = stats?.completed ?? 0;
            const autoclosed = stats?.autoclosed ?? 0;
            const items = stats?.top5items ?? [];
            if (pending === 0 &&
                completed === 0 &&
                autoclosed === 0 &&
                !hasMeaningfulItems(items)) {
                delete filteredData.attributes.responseMap[type];
            }
        }
    }
    // ---------------------------------------------------
    // 5. Filter EMPTY DECENTRALIZED attestation types
    // ---------------------------------------------------
    if (filteredData?.workflowArgs) {
        for (const [type, stats] of Object.entries(filteredData.workflowArgs)) {
            const pending = stats?.pending ?? 0;
            const completed = stats?.completed ?? 0;
            const autoclosed = stats?.autoclosed ?? 0;
            const items = stats?.top5items ?? [];
            if (pending === 0 &&
                completed === 0 &&
                autoclosed === 0 &&
                !hasMeaningfulItems(items)) {
                delete filteredData.workflowArgs[type];
            }
        }
    }
    // ---------------------------------------------------
    // 6. Log "No Attestation Data" case
    // ---------------------------------------------------
    const hasAnyData = (filteredData.attributes?.responseMap &&
        Object.keys(filteredData.attributes.responseMap).length > 0) ||
        (filteredData.workflowArgs &&
            Object.keys(filteredData.workflowArgs).length > 0);
    if (!hasAnyData) {
        logger_utils_1.default.info('No attestation data available for user', { owner });
    }
    // ---------------------------------------------------
    // 7. Store FILTERED snapshot in Redis (SKIP if dummy data)
    // ---------------------------------------------------
    if (redis_service_1.default.isReady() && !result.isDummy) {
        await redis_service_1.default.set(cacheKey, { data: filteredData, isDummy: result.isDummy }, DASHBOARD_TTL_SECONDS);
    }
    const latencyMs = Date.now() - start;
    logger_utils_1.default.info('DASHBOARD FETCHED FROM IAM', {
        key: cacheKey,
        latencyMs,
        isDummy: result.isDummy,
    });
    // ---------------------------------------------------
    // 8. Return filtered response
    // ---------------------------------------------------
    return {
        data: filteredData,
        cache: {
            status: 'MISS',
            key: cacheKey,
            latencyMs,
            isDummy: result.isDummy,
        },
    };
}
//# sourceMappingURL=dashboard.service.js.map