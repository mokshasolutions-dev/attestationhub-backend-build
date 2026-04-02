import { BaseService } from '../base.service';
import { AttestationListItem, SignoffStatus } from './list.transformer';
export type AttestationType = 'application' | 'birthright' | 'entitlement' | 'decentralized' | 'privileged';
interface GetListParams {
    owner: string;
    type: AttestationType;
    page?: number;
    pageSize?: number;
    signoffstatus?: SignoffStatus;
    search?: string;
}
export declare class ListsService extends BaseService {
    constructor();
    /**
     * Fetch attestation list for owner + type
     * Filtering, sorting, pagination handled in backend
     */
    getAttestationList({ owner, type, page, pageSize, signoffstatus, search, }: GetListParams): Promise<{
        data: {
            items: AttestationListItem[];
            page: number;
            pageSize: number;
            totalItems: number;
            totalPages: number;
        };
        cache: {
            status: "HIT" | "MISS" | "BYPASS";
            key: string;
            latencyMs: number;
            isDummy: boolean;
        };
    }>;
}
export declare const listsService: ListsService;
export {};
//# sourceMappingURL=list.service.d.ts.map