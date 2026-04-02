import { BaseActionService } from './base.action.service';
import { ActionEntity } from '../../types/actionTypes';
declare class ApplicationActionService extends BaseActionService {
    constructor();
    /**
     * SAVE
     * Persists decisions only
     */
    handleSave(input: {
        owner: string;
        attestationname: string;
        list: ActionEntity[];
        comments?: string;
        signoffstatus?: boolean;
    }): Promise<any>;
    /**
     * SIGNOFF
     * Completes attestation
     */
    handleSignoff(input: {
        owner: string;
        attestationname: string;
        list: ActionEntity[];
        comments?: string;
        signoffstatus?: boolean;
    }): Promise<any>;
}
export declare const applicationActionService: ApplicationActionService;
export {};
//# sourceMappingURL=application.action.service.d.ts.map