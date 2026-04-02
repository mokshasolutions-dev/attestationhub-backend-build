"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveAttestationDetails = getActiveAttestationDetails;
const redis_service_1 = __importDefault(require("../redis/redis.service"));
const config_1 = require("../../config");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const details_transformer_1 = require("./details.transformer");
const details_cache_1 = require("./details.cache");
async function getActiveAttestationDetails(owner, attestationType, attestationname, page, pageSize, search) {
    logger_utils_1.default.info('DETAILS SERVICE CALLED', { owner, attestationType, attestationname });
    /**
     * 1. Redis cache lookup (BASE DETAIL ONLY)
     */
    const cacheKey = (0, details_cache_1.getDetailsCacheKey)(owner, attestationType, attestationname);
    const start = Date.now();
    let cacheStatus = 'MISS';
    let isDummy = false;
    let baseResponse = null;
    if (config_1.Config.REDIS_ENABLED && !config_1.Config.IAM_USE_DUMMY_DATA) {
        try {
            const cached = await redis_service_1.default.get(cacheKey);
            if (cached) {
                baseResponse = cached.data;
                isDummy = cached.isDummy;
                cacheStatus = 'HIT';
                logger_utils_1.default.info('REDIS CACHE HIT', {
                    key: cacheKey,
                    latencyMs: Date.now() - start,
                    isDummy,
                });
            }
            else {
                cacheStatus = 'MISS';
                logger_utils_1.default.info('REDIS CACHE MISS', {
                    key: cacheKey,
                });
            }
        }
        catch (error) {
            logger_utils_1.default.warn('Redis cache lookup failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                key: cacheKey
            });
            baseResponse = null;
        }
    }
    else {
        cacheStatus = 'BYPASS';
    }
    /**
     * 2. Fetch from IAM if cache miss
     */
    if (!baseResponse) {
        const fresh = await (0, details_cache_1.fetchAndTransformDetails)(owner, attestationType, attestationname);
        baseResponse = fresh.data;
        isDummy = fresh.isDummy;
        // Async cache update
        await (0, details_cache_1.updateDetailsCache)(owner, attestationType, attestationname, baseResponse, isDummy);
        logger_utils_1.default.info('DETAILS FETCHED FROM IAM', {
            key: cacheKey,
            latencyMs: Date.now() - start,
            isDummy,
        });
    }
    // Final safety check: if baseResponse is still null (e.g., all fetch attempts/transformers failed),
    // provide a minimal valid fallback based on the attestation type.
    if (!baseResponse) {
        logger_utils_1.default.warn('baseResponse is null after all fetch attempts. Providing empty fallback.', { owner, attestationType, attestationname });
        isDummy = true; // Hard failure fallback is definitely dummy/empty
        if (attestationType === 'decentralized') {
            baseResponse = (0, details_transformer_1.transformDecentralizedAttestation)({});
        }
        else {
            baseResponse = (0, details_transformer_1.transformActiveAttestation)({}, attestationType);
        }
    }
    const latencyMs = Date.now() - start;
    /**
     * 3. PAGINATION DECISION
     */
    if (attestationType === 'decentralized') {
        const decentralizedResponse = baseResponse;
        return {
            data: {
                chart: decentralizedResponse?.chart,
                details: decentralizedResponse?.details,
                data: {
                    items: decentralizedResponse?.items ?? [],
                    pagination: null,
                },
            },
            cache: {
                status: cacheStatus,
                key: cacheKey,
                latencyMs,
                isDummy,
            },
        };
    }
    /**
     * 4. NORMAL PAGINATION & SEARCH
     */
    const normalResponse = baseResponse;
    let allItems = normalResponse?.items ?? [];
    // FILTERING LOGIC
    if (search && search.trim() !== '') {
        const lowerSearch = search.toLowerCase();
        allItems = allItems.filter((item) => {
            // Birthright -> roleName
            if (attestationType === 'birthright') {
                const brItem = item; // Cast to access specific fields safely
                return brItem.roleName?.toLowerCase().includes(lowerSearch);
            }
            // Entitlement, Privileged, Application -> value
            if (['entitlement', 'privileged', 'application'].includes(attestationType)) {
                const valItem = item;
                return valItem.value?.toLowerCase().includes(lowerSearch);
            }
            return true;
        });
    }
    const totalItems = allItems.length;
    const pagesize = pageSize;
    const totalPages = pagesize > 0
        ? Math.ceil(totalItems / pagesize)
        : 0;
    const safePage = page > 0 ? page : 1;
    const startIndex = (safePage - 1) * pagesize;
    const endIndex = startIndex + pagesize;
    const paginatedItems = startIndex >= totalItems
        ? []
        : allItems.slice(startIndex, endIndex);
    return {
        data: {
            chart: normalResponse?.chart,
            details: normalResponse?.details,
            data: {
                isReadyForSignoff: normalResponse?.chart?.pending === 0,
                items: paginatedItems,
                pagination: {
                    page: safePage,
                    pageSize,
                    totalItems,
                    totalPages,
                }
            },
        },
        cache: {
            status: cacheStatus,
            key: cacheKey,
            latencyMs,
            isDummy,
        },
    };
}
//# sourceMappingURL=details.services.js.map