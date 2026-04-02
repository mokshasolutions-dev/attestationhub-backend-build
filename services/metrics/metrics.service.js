"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = void 0;
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
/**
 * MetricsService
 * Handles internal observability for action APIs.
 * Ensures low cardinality for labels (no raw names).
 * Failure-isolated: never throws or affects request flow.
 */
class MetricsService {
    /**
     * Record a request count
     */
    recordRequest(labels) {
        try {
            // In a real app, this would push to Prometheus/Datadog
            // For now, we use structured telemetry logging
            logger_utils_1.default.info('METRIC:REQUEST_COUNT', {
                type: labels.type,
                operation: labels.operation,
            });
        }
        catch (error) {
            // Failure isolation: log but don't throw
            logger_utils_1.default.debug('Failed to record request metric', { error });
        }
    }
    /**
     * Record a failure count
     */
    recordFailure(labels) {
        try {
            logger_utils_1.default.info('METRIC:FAILURE_COUNT', {
                type: labels.type,
                operation: labels.operation,
                reason: labels.reason || 'unknown',
            });
        }
        catch (error) {
            logger_utils_1.default.debug('Failed to record failure metric', { error });
        }
    }
    /**
     * Record IAM latency
     */
    recordLatency(labels, latencyMs) {
        try {
            logger_utils_1.default.info('METRIC:IAM_LATENCY', {
                type: labels.type,
                operation: labels.operation,
                latencyMs,
            });
        }
        catch (error) {
            logger_utils_1.default.debug('Failed to record latency metric', { error });
        }
    }
}
exports.metricsService = new MetricsService();
exports.default = exports.metricsService;
//# sourceMappingURL=metrics.service.js.map