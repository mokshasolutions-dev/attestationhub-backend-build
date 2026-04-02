import { SailPointWorkflowResponse, CacheMetadata } from '../../types';
/**
 * Dashboard Data Service
 * - Filters attestation types with NO real data
 * - Redis stores only filtered snapshot
 * - SailPoint remains source of truth
 */
export declare function getDashboardData(owner: string): Promise<{
    data: SailPointWorkflowResponse;
    cache: CacheMetadata;
}>;
//# sourceMappingURL=dashboard.service.d.ts.map