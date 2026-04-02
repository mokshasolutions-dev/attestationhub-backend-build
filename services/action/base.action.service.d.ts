import { ActionEntity } from '../../types/actionTypes';
import { ActionAttestationType } from '../../config/workflowResolver';
import { BaseService } from '../base.service';
export declare abstract class BaseActionService extends BaseService {
    constructor(serviceName: string);
    protected checkEligibility(items: ActionEntity[], type: ActionAttestationType, isSignoff?: boolean): ActionEntity[];
    protected refreshCacheAfterAction(owner: string, type: ActionAttestationType, attestationname: string): Promise<{
        signoffstatus: string;
        signoffdate: string | null | undefined;
    }>;
    protected processAction(input: {
        type: ActionAttestationType;
        owner: string;
        attestationname: string;
        list: ActionEntity[];
        isSignoff: boolean;
        comments?: string;
        signoffstatus?: boolean;
    }): Promise<any>;
}
//# sourceMappingURL=base.action.service.d.ts.map