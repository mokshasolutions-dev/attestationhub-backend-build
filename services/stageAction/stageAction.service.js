"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stageActionService = exports.StageActionService = void 0;
const iam_service_1 = __importDefault(require("../iam/iam.service"));
const redis_service_1 = __importDefault(require("../redis/redis.service"));
const config_1 = require("../../config");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const staging_cache_1 = require("../staging/staging.cache");
class StageActionService {
    /**
     * Performs a stage action by calling SailPoint workflow and clearing relevant cache
     */
    async performStageAction(params) {
        const { attestationName, action, type } = params;
        const cacheKey = (0, staging_cache_1.getStagingCacheKey)(type);
        // 1. Call IAM workflow (mapping action -> status)
        const { data, isDummy } = await iam_service_1.default.launchStageActionWorkflow(attestationName, action, type);
        // 2. Clear Cache if not using dummy data
        if (config_1.Config.REDIS_ENABLED && !isDummy) {
            try {
                // Clear staging list cache
                await redis_service_1.default.del(cacheKey);
                // Clear all List API caches for this type to stay in sync with SailPoint
                const listPattern = `list:*:${type}`;
                await redis_service_1.default.deletePattern(listPattern);
                logger_utils_1.default.info('Caches cleared after stage action', { type, cacheKey, listPattern });
            }
            catch (error) {
                logger_utils_1.default.warn('Failed to clear caches after action', { type, cacheKey, error });
            }
        }
        const isSuccess = data?.errors === null && data?.failure === false;
        logger_utils_1.default.info('Stage Action Final Result', {
            attestationName,
            action,
            type,
            isSuccess,
            sailPointResponse: data
        });
        return {
            success: isSuccess
        };
    }
}
exports.StageActionService = StageActionService;
exports.stageActionService = new StageActionService();
//# sourceMappingURL=stageAction.service.js.map