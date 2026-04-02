import { BaseActionService } from './base.action.service';
import { ActionEntity } from '../../types/actionTypes';
declare class BirthrightActionService extends BaseActionService {
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
export declare const birthrightActionService: BirthrightActionService;
export {};
//# sourceMappingURL=birthright.action.service.d.ts.map