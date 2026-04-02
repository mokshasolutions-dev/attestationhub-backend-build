import { BaseActionService } from './base.action.service';
import { ActionEntity } from '../../types/actionTypes';
import { DecentralizedItem } from '../../types/detailsTypes';
declare class DecentralizedActionService extends BaseActionService {
    constructor();
    /**
     * Universal helper for Decentralized actions (Save/Signoff)
     */
    private executeDecentralizedAction;
    /**
     * SAVE
     */
    handleSave(input: {
        owner: string;
        attestationname: string;
        list: ActionEntity[];
        comments?: string;
    }): Promise<{
        success: boolean;
        chart: {
            completed: number;
            notCompleted: number;
        };
        details: {
            signoffstatus: string;
            signoffdate: string | null | undefined;
            owner: string;
            created?: string;
            duedate?: string | null;
        };
        data: {
            attestationname: string;
            items: DecentralizedItem[];
            pagination: null;
        };
    }>;
    /**
     * SIGNOFF
     */
    handleSignoff(input: {
        owner: string;
        attestationname: string;
        list: ActionEntity[];
        comments?: string;
    }): Promise<{
        success: boolean;
        chart: {
            completed: number;
            notCompleted: number;
        };
        details: {
            signoffstatus: string;
            signoffdate: string | null | undefined;
            owner: string;
            created?: string;
            duedate?: string | null;
        };
        data: {
            attestationname: string;
            items: DecentralizedItem[];
            pagination: null;
        };
    }>;
    /**
     * Helper to generate CSV content for JDBC automation
     */
    private generateJDBCVersionCSV;
}
export declare const decentralizedActionService: DecentralizedActionService;
export {};
//# sourceMappingURL=decentralized.action.service.d.ts.map