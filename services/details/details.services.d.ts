import { CacheMetadata } from '../../types';
import { AttestationResponse } from '../../types/detailsTypes';
export declare function getActiveAttestationDetails(owner: string, attestationType: string, attestationname: string, page: number, pageSize: number, search?: string): Promise<{
    data: AttestationResponse;
    cache: CacheMetadata;
}>;
//# sourceMappingURL=details.services.d.ts.map