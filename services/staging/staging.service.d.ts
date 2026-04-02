import { CacheMetadata } from '../../types';
import { StagingResponse } from './staging.transformer';
export interface GetStagingDataParams {
    attestationType: string;
    page: number;
    pageSize: number;
}
declare class StagingService {
    getStagingData(params: GetStagingDataParams): Promise<{
        data: StagingResponse;
        cache: CacheMetadata;
    }>;
    generateStagingCsv(attestationName: string, attestationType: string): Promise<string>;
    private escapeCsv;
}
export declare const stagingService: StagingService;
export {};
//# sourceMappingURL=staging.service.d.ts.map