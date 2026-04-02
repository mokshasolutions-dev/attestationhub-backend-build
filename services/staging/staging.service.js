"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stagingService = void 0;
const iam_service_1 = __importDefault(require("../iam/iam.service"));
const redis_service_1 = __importDefault(require("../redis/redis.service"));
const config_1 = require("../../config");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const staging_transformer_1 = require("./staging.transformer");
const staging_cache_1 = require("./staging.cache");
class StagingService {
    async getStagingData(params) {
        const { attestationType, page, pageSize } = params;
        const cacheKey = (0, staging_cache_1.getStagingCacheKey)(attestationType);
        const start = Date.now();
        let cacheStatus = 'MISS';
        let isDummy = false;
        let allItems = null;
        // 1. Redis Cache Lookup
        if (config_1.Config.REDIS_ENABLED && !config_1.Config.IAM_USE_DUMMY_DATA) {
            try {
                const cached = await redis_service_1.default.get(cacheKey);
                if (cached) {
                    allItems = cached.items;
                    isDummy = cached.isDummy;
                    cacheStatus = 'HIT';
                }
            }
            catch (error) {
                logger_utils_1.default.warn('Staging cache lookup failed', { error, cacheKey });
            }
        }
        else {
            cacheStatus = 'BYPASS';
        }
        // 2. Fetch from IAM if cache miss
        if (!allItems) {
            const { data: sailpointResponse, isDummy: fetchedIsDummy } = await iam_service_1.default.launchStageWorkflow(attestationType);
            isDummy = fetchedIsDummy;
            const responseMap = sailpointResponse?.attributes?.responseMap || {};
            allItems = (0, staging_transformer_1.transformStageResponse)(responseMap);
            // Async cache update
            if (config_1.Config.REDIS_ENABLED && !isDummy) {
                redis_service_1.default.set(cacheKey, { items: allItems, isDummy }, staging_cache_1.STAGING_TTL_SECONDS)
                    .catch(err => logger_utils_1.default.warn('Staging cache update failed', { err, cacheKey }));
            }
        }
        // 3. Pagination
        const totalItems = allItems.length;
        const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;
        const safePage = page > 0 ? page : 1;
        const startIndex = (safePage - 1) * pageSize;
        const paginatedItems = allItems.slice(startIndex, startIndex + pageSize);
        // Only send owner and attestationname to frontend
        const minimalItems = paginatedItems.map(item => ({
            owner: item.owner,
            attestationname: item.attestationname
        }));
        return {
            data: {
                items: minimalItems, // Cast to any to bypass the full StagingItem requirement if necessary
                pagination: {
                    page: safePage,
                    pageSize,
                    totalItems,
                    totalPages
                }
            },
            cache: {
                status: cacheStatus,
                key: cacheKey,
                latencyMs: Date.now() - start,
                isDummy
            }
        };
    }
    async generateStagingCsv(attestationName, attestationType) {
        const cacheKey = (0, staging_cache_1.getStagingCacheKey)(attestationType);
        const cached = await redis_service_1.default.get(cacheKey);
        if (!cached || !cached.items) {
            throw new Error(`No cached data found for type '${attestationType}'. Please refresh the list before downloading.`);
        }
        const filteredItems = cached.items.filter(item => item.attestationname === attestationName);
        if (filteredItems.length === 0) {
            throw new Error(`Attestation '${attestationName}' not found in the cached list for '${attestationType}'.`);
        }
        let headers;
        const type = attestationType.toLowerCase();
        if (type === 'application') {
            headers = [
                'attestationname', 'owner', 'requester', 'application', 'type', 'attribute',
                'value', 'displayname', 'signoffstatus', 'created', 'description', 'businessappname'
            ];
        }
        else if (type === 'entitlement') {
            headers = [
                'attestationname', 'owner', 'requester', 'application', 'type', 'signoffstatus',
                'created', 'description', 'accesstype', 'businessappname', 'iscertifiable',
                'isprivaccessrequired', 'isrequestable', 'issensitive'
            ];
        }
        else {
            // Default to Birthright format
            headers = [
                'attestationname', 'owner', 'requester', 'type', 'signoffstatus', 'created',
                'rolename', 'roledisplayname', 'roleownerdisplayname', 'assignmentcriteria',
                'assignmentrule', 'requireditroles', 'requireditrolesdisplayname'
            ];
        }
        const csvLines = [
            attestationName,
            headers.join(','),
            ...filteredItems.map(item => headers.map(header => this.escapeCsv(item[header])).join(','))
        ];
        return csvLines.join('\n');
    }
    escapeCsv(val) {
        if (val === null || val === undefined)
            return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
}
exports.stagingService = new StagingService();
//# sourceMappingURL=staging.service.js.map