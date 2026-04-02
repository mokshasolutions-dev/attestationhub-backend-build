"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAGING_TTL_SECONDS = void 0;
exports.getStagingCacheKey = getStagingCacheKey;
exports.STAGING_TTL_SECONDS = 360; // 1 hour
function getStagingCacheKey(attestationType) {
    return `staging:${attestationType.toLowerCase()}`;
}
//# sourceMappingURL=staging.cache.js.map