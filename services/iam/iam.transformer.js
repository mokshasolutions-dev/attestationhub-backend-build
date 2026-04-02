"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAMTransformer = void 0;
/**
 * IAM Transformer - Transforms IAM SaaS data to frontend-friendly format
 */
class IAMTransformer {
    /**
     * Transform SailPoint workflow response to Dashboard format
     */
    static transformDashboardData(response) {
        const stats = {};
        // Fallback: Check attributes.responseMap first, then workflowArgs
        const rawData = (response.attributes?.responseMap && Object.keys(response.attributes.responseMap).length > 0)
            ? response.attributes.responseMap
            : response.workflowArgs;
        if (!rawData)
            return stats;
        for (const key in rawData) {
            if (Object.prototype.hasOwnProperty.call(rawData, key)) {
                const value = rawData[key];
                if (!value)
                    continue;
                // Capitalize the first letter for the key
                const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                stats[capitalizedKey] = {
                    completed: value.completed ?? 0,
                    pending: value.pending ?? 0,
                    autoclosed: value.autoclosed ?? 0,
                    top5items: value.top5items || [],
                };
            }
        }
        return stats;
    }
}
exports.IAMTransformer = IAMTransformer;
exports.default = IAMTransformer;
//# sourceMappingURL=iam.transformer.js.map