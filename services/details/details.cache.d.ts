import { AllAttestationResponse } from '../../types/detailsTypes';
export declare const CACHE_VERSION = "v1";
export declare const DETAILS_TTL_SECONDS = 60;
/**
 * Build standardized cache key for details
 * IDENTITY: workItemId is preferred for uniqueness, falling back to attestationname.
 */
export declare function getDetailsCacheKey(owner: string, type: string, identifier: string): string;
/**
 * Fetch fresh data from IAM and transform it (BYPASS CACHE)
 */
export declare function fetchAndTransformDetails(owner: string, type: string, attestationname: string): Promise<{
    data: AllAttestationResponse;
    isDummy: boolean;
}>;
/**
 * Authoritative fetch: Cache first, then IAM.
 * Used by Action service to avoid overwriting optimistic state.
 */
export declare function getAuthoritativeDetails(owner: string, type: string, attestationname: string): Promise<{
    data: AllAttestationResponse;
    isDummy: boolean;
}>;
/**
 * Update Redis cache with fresh SailPoint data
 * WRAPS redisService.set with mandatory policy: Full overwrite, no patching, non-blocking fail.
 */
export declare function updateDetailsCache(owner: string, type: string, attestationname: string, data: AllAttestationResponse, isDummy: boolean, throwOnError?: boolean): Promise<void>;
/**
 * Fetch raw cached details (for Merge/Signoff flow)
 */
export declare function getCachedDetails(owner: string, type: string, workItemId: string): Promise<{
    data: AllAttestationResponse;
    isDummy: boolean;
} | null>;
/**
 * Delete cache for an attestation
 */
export declare function deleteDetailsCache(owner: string, type: string, workItemId: string, attestationname?: string): Promise<void>;
//# sourceMappingURL=details.cache.d.ts.map