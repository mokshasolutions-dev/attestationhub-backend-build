"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DETAILS_TTL_SECONDS = exports.CACHE_VERSION = void 0;
exports.getDetailsCacheKey = getDetailsCacheKey;
exports.fetchAndTransformDetails = fetchAndTransformDetails;
exports.getAuthoritativeDetails = getAuthoritativeDetails;
exports.updateDetailsCache = updateDetailsCache;
exports.getCachedDetails = getCachedDetails;
exports.deleteDetailsCache = deleteDetailsCache;
const iam_service_1 = __importDefault(require("../iam/iam.service"));
const redis_service_1 = __importDefault(require("../redis/redis.service"));
const config_1 = require("../../config");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const details_transformer_1 = require("./details.transformer");
exports.CACHE_VERSION = 'v1';
exports.DETAILS_TTL_SECONDS = 60;
/**
 * Build standardized cache key for details
 * IDENTITY: workItemId is preferred for uniqueness, falling back to attestationname.
 */
function getDetailsCacheKey(owner, type, identifier) {
    // identifier can be workItemId (preferred) or attestationname
    return `details:${exports.CACHE_VERSION}:${owner}:${type}:${encodeURIComponent(identifier)}`;
}
/**
 * Fetch fresh data from IAM and transform it (BYPASS CACHE)
 */
async function fetchAndTransformDetails(owner, type, attestationname) {
    const result = await iam_service_1.default.getAttestationDetails(owner, type, attestationname);
    const isDummy = result.isDummy;
    const iamResponse = result.data;
    let baseResponse;
    if (type === 'decentralized') {
        const rawWorkflowArgs = iamResponse.workflowArgs ?? {};
        const filteredWorkflowArgs = {};
        // 1. Check for flat structure: workflowArgs -> items -> [attestationname] -> {item}
        if (rawWorkflowArgs.items?.[attestationname]) {
            filteredWorkflowArgs[attestationname] = rawWorkflowArgs.items[attestationname];
        }
        // 2. Check for flat structure: workflowArgs -> [attestationname]
        else if (rawWorkflowArgs[attestationname]) {
            filteredWorkflowArgs[attestationname] = rawWorkflowArgs[attestationname];
        }
        // 3. Check for direct array/object index in workflowArgs (legacy or other variants)
        else if (Object.keys(rawWorkflowArgs).length > 0) {
            // Optional: search for the attestationname keys at the root
            Object.entries(rawWorkflowArgs).forEach(([key, val]) => {
                if (key === attestationname) {
                    filteredWorkflowArgs[key] = val;
                }
            });
        }
        // FALLBACK: If still empty, check attributes.responseMap
        if (Object.keys(filteredWorkflowArgs).length === 0 && iamResponse?.attributes?.responseMap) {
            const rawMap = iamResponse.attributes.responseMap;
            const value = rawMap[attestationname];
            if (Array.isArray(value)) {
                filteredWorkflowArgs[attestationname] = value[0];
            }
            else if (value && typeof value === 'object') {
                filteredWorkflowArgs[attestationname] = value;
            }
        }
        baseResponse = (0, details_transformer_1.transformDecentralizedAttestation)(filteredWorkflowArgs);
    }
    else {
        const rawResponseMap = iamResponse?.attributes?.responseMap;
        const normalizedResponseMap = {};
        if (rawResponseMap && typeof rawResponseMap === 'object') {
            for (const [key, value] of Object.entries(rawResponseMap)) {
                if (key === attestationname) {
                    normalizedResponseMap[key] = Array.isArray(value) ? value : [];
                }
            }
        }
        baseResponse = (0, details_transformer_1.transformActiveAttestation)(normalizedResponseMap, type);
    }
    return { data: baseResponse, isDummy };
}
/**
 * Authoritative fetch: Cache first, then IAM.
 * Used by Action service to avoid overwriting optimistic state.
 */
async function getAuthoritativeDetails(owner, type, attestationname) {
    // Try cache first
    const cached = await redis_service_1.default.get(getDetailsCacheKey(owner, type, attestationname));
    if (cached) {
        logger_utils_1.default.info('REDIS AUTHORITATIVE HIT (PRESISTING STATE)', { owner, type, attestationname });
        return cached;
    }
    // Fallback to IAM
    return fetchAndTransformDetails(owner, type, attestationname);
}
/**
 * Update Redis cache with fresh SailPoint data
 * WRAPS redisService.set with mandatory policy: Full overwrite, no patching, non-blocking fail.
 */
async function updateDetailsCache(owner, type, attestationname, data, isDummy, throwOnError = false) {
    if (!config_1.Config.REDIS_ENABLED || isDummy)
        return;
    // IDENTITY: Use workitem ID as the primary identity for the draft if available
    let identity = attestationname;
    if (type === 'decentralized' && data.items?.[0] && 'workitem' in data.items[0]) {
        const item = data.items[0];
        if (item.workitem) {
            identity = String(item.workitem);
        }
    }
    const key = getDetailsCacheKey(owner, type, identity);
    try {
        await redis_service_1.default.set(key, { data, isDummy }, exports.DETAILS_TTL_SECONDS);
        logger_utils_1.default.info('REDIS CACHE UPDATED (AUTHORITATIVE)', { key, type, identity });
        // BACKWARD COMPAT: If identity was workitem, also update the attestationname key
        // so the normal GET /details (discovery) can still find it.
        if (identity !== attestationname) {
            const aliasKey = getDetailsCacheKey(owner, type, attestationname);
            await redis_service_1.default.set(aliasKey, { data, isDummy }, exports.DETAILS_TTL_SECONDS);
        }
    }
    catch (error) {
        logger_utils_1.default.warn('Redis cache update failed', {
            key,
            error: error instanceof Error ? error.message : String(error)
        });
        if (throwOnError)
            throw error;
    }
}
/**
 * Fetch raw cached details (for Merge/Signoff flow)
 */
async function getCachedDetails(owner, type, workItemId) {
    const key = getDetailsCacheKey(owner, type, workItemId);
    return redis_service_1.default.get(key);
}
/**
 * Delete cache for an attestation
 */
async function deleteDetailsCache(owner, type, workItemId, attestationname) {
    const primaryKey = getDetailsCacheKey(owner, type, workItemId);
    await redis_service_1.default.del(primaryKey);
    if (attestationname) {
        const aliasKey = getDetailsCacheKey(owner, type, attestationname);
        await redis_service_1.default.del(aliasKey);
    }
    logger_utils_1.default.info('REDIS CACHE INVALIDATED (SUCCESSFUL SIGNOFF)', { workItemId, attestationname });
}
//# sourceMappingURL=details.cache.js.map