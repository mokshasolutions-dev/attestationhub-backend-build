import { BaseActionService } from './base.action.service';
import { ActionEntity } from '../../types/actionTypes';
declare class EntitlementActionService extends BaseActionService {
    constructor();
    /**
     * SAVE
     * Entitlement SAVE is allowed but may be ignored by SailPoint (doc behavior)
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
     * Completes entitlement attestation (DOC-CORRECT)
     */
    handleSignoff(input: {
        owner: string;
        attestationname: string;
        list: ActionEntity[];
        comments?: string;
        signoffstatus?: boolean;
    }): Promise<any>;
    /**
     * Internal shared logic
     */
    private handleInternal;
}
export declare const entitlementActionService: EntitlementActionService;
export {};
//# sourceMappingURL=entitlement.action.service.d.ts.map