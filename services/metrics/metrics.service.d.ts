export interface MetricLabels {
    type: string;
    operation: string;
    status?: string;
    reason?: string;
}
/**
 * MetricsService
 * Handles internal observability for action APIs.
 * Ensures low cardinality for labels (no raw names).
 * Failure-isolated: never throws or affects request flow.
 */
declare class MetricsService {
    /**
     * Record a request count
     */
    recordRequest(labels: MetricLabels): void;
    /**
     * Record a failure count
     */
    recordFailure(labels: MetricLabels): void;
    /**
     * Record IAM latency
     */
    recordLatency(labels: MetricLabels, latencyMs: number): void;
}
export declare const metricsService: MetricsService;
export default metricsService;
//# sourceMappingURL=metrics.service.d.ts.map