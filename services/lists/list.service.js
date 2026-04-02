"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listsService = exports.ListsService = void 0;
const base_service_1 = require("../base.service");
const iam_service_1 = require("../iam/iam.service");
const redis_service_1 = __importDefault(require("../redis/redis.service"));
const config_1 = require("../../config");
const list_transformer_1 = require("./list.transformer");
const LIST_TTL_SECONDS = 180;
class ListsService extends base_service_1.BaseService {
    constructor() {
        super('ListsService');
    }
    /**
     * Fetch attestation list for owner + type
     * Filtering, sorting, pagination handled in backend
     */
    async getAttestationList({ owner, type, page = 1, pageSize = 20, signoffstatus, search, }) {
        this.logger.info('LIST SERVICE CALLED', { owner, type });
        // ----------------------------
        // 1. Normalize inputs (NO MAX CAP)
        // ----------------------------
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.max(Number(pageSize) || 20, 1);
        const safeSearch = search?.trim().toLowerCase();
        // ----------------------------
        // 2. Redis cache lookup (BASE LIST ONLY)
        // ----------------------------
        const cacheKey = `list:${owner}:${type}`;
        const start = Date.now();
        let cacheStatus = 'MISS';
        let isDummy = false;
        let baseItems = null;
        if (config_1.Config.REDIS_ENABLED && !config_1.Config.IAM_USE_DUMMY_DATA) {
            const cached = await redis_service_1.default.get(cacheKey);
            if (cached) {
                baseItems = cached.data;
                isDummy = cached.isDummy;
                cacheStatus = 'HIT';
                this.logger.info('REDIS CACHE HIT', {
                    key: cacheKey,
                    latencyMs: Date.now() - start,
                    isDummy,
                });
            }
            else {
                cacheStatus = 'MISS';
                this.logger.info('REDIS CACHE MISS', {
                    key: cacheKey,
                });
            }
        }
        else {
            cacheStatus = 'BYPASS';
        }
        // ----------------------------
        // 3. Fetch from IAM if cache miss
        // ----------------------------
        if (!baseItems) {
            const result = await iam_service_1.iamService.getAttestationList(owner, type);
            isDummy = result.isDummy;
            const rawMap = (result.data.attributes?.responseMap && Object.keys(result.data.attributes.responseMap).length > 0)
                ? result.data.attributes.responseMap
                : result.data.workflowArgs;
            if (!rawMap) {
                this.logger.warn('SailPoint list response missing both responseMap and workflowArgs. Returning empty list.', {
                    owner,
                    type,
                    isDummy
                });
                baseItems = [];
            }
            else {
                // Transform to flat list (CACHE THIS)
                baseItems = list_transformer_1.ListsTransformer.transform(rawMap);
            }
            // Store in Redis (SKIP if dummy data)
            if (config_1.Config.REDIS_ENABLED && !isDummy) {
                await redis_service_1.default.set(cacheKey, { data: baseItems, isDummy }, LIST_TTL_SECONDS);
            }
            this.logger.info('LIST FETCHED FROM IAM', {
                key: cacheKey,
                latencyMs: Date.now() - start,
                isDummy,
            });
        }
        const latencyMs = Date.now() - start;
        // Work on a copy to avoid mutation leaks
        let items = [...baseItems];
        // ----------------------------
        // 4. Status filter
        // ----------------------------
        if (signoffstatus) {
            if (signoffstatus === 'Pending') {
                items = items.filter((item) => item.signoffstatus === 'Pending' || item.signoffstatus === 'Ready');
            }
            else {
                items = items.filter((item) => item.signoffstatus === signoffstatus);
            }
        }
        // ----------------------------
        // 5. Search filter
        // ----------------------------
        if (safeSearch) {
            items = items.filter((item) => item.attestationname
                .toLowerCase()
                .includes(safeSearch));
        }
        // ----------------------------
        // 6. Stable sorting
        // ----------------------------
        items.sort((a, b) => a.attestationname.localeCompare(b.attestationname));
        // ----------------------------
        // 7. Pagination (DATA-DRIVEN)
        // ----------------------------
        const totalItems = items.length;
        const totalPages = totalItems === 0
            ? 0
            : Math.ceil(totalItems / safeLimit);
        const offset = (safePage - 1) * safeLimit;
        const paginatedItems = items.slice(offset, offset + safeLimit);
        // ----------------------------
        // 8. Response
        // ----------------------------
        return {
            data: {
                items: paginatedItems,
                page: safePage,
                pageSize: safeLimit,
                totalItems,
                totalPages,
            },
            cache: {
                status: cacheStatus,
                key: cacheKey,
                latencyMs,
                isDummy,
            },
        };
    }
}
exports.ListsService = ListsService;
exports.listsService = new ListsService();
//# sourceMappingURL=list.service.js.map