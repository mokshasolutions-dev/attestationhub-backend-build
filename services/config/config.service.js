"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableAttestationTypes = getAvailableAttestationTypes;
const dashboard_service_1 = require("../dashboard/dashboard.service");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
async function getAvailableAttestationTypes(owner) {
    const dashboardResult = await (0, dashboard_service_1.getDashboardData)(owner);
    const raw = dashboardResult.data;
    const dashboardPayload = raw?.attributes?.responseMap &&
        typeof raw.attributes.responseMap === 'object'
        ? raw.attributes.responseMap
        : {};
    const available = extractAvailableTypes(dashboardPayload);
    logger_utils_1.default.info('Derived available attestation types from dashboard', {
        owner,
        availableAttestations: available,
        cacheStatus: dashboardResult.cache.status,
    });
    return {
        data: available,
        cache: dashboardResult.cache,
    };
}
/* =========================
   Helper functions (PRIVATE)
   ========================= */
function extractAvailableTypes(dashboardData) {
    if (!dashboardData || typeof dashboardData !== 'object') {
        return [];
    }
    return Object.entries(dashboardData)
        .filter(([_, section]) => {
        if (!section || typeof section !== 'object')
            return false;
        const pending = Number(section.pending ?? 0);
        const completed = Number(section.completed ?? 0);
        const autoclosed = Number(section.autoclosed ?? 0);
        return pending > 0 || completed > 0 || autoclosed > 0;
    })
        .map(([key]) => capitalize(key));
}
function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
//# sourceMappingURL=config.service.js.map