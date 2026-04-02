import { BaseActionService } from './base.action.service';
import { ActionEntity } from '../../types/actionTypes';
declare class PrivilegedActionService extends BaseActionService {
    constructor();
    /**
     * SAVE
     * Does NOT complete workflow
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
     * Completes workflow
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
export declare const privilegedActionService: PrivilegedActionService;
export {};
//# sourceMappingURL=privileged.action.service.d.ts.map