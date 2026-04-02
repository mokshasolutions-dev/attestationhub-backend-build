import { BaseService } from '../base.service';
import { SailPointWorkflowResponse } from '../../types';
import { SailPointListResponse } from '../../types/sailpoint-list.types';
import { ActionOperation, ActionAttestationType } from '../../config/workflowResolver';
/**
 * IAM Service - Handles communication with SailPoint Workflow API
 */
declare class IAMService extends BaseService {
    private client;
    constructor();
    private getCredential;
    private createClient;
    launchAttestationStatistics(owner: string): Promise<{
        data: SailPointWorkflowResponse;
        isDummy: boolean;
    }>;
    getAttestationList(owner: string, type: string): Promise<{
        data: SailPointListResponse;
        isDummy: boolean;
    }>;
    private getListDummy;
    getAttestationDetails<T>(owner: string, attestationType: string, attestationName: string): Promise<{
        data: T;
        isDummy: boolean;
    }>;
    private getDetailsDummy;
    launchStageWorkflow(attestationType: string): Promise<{
        data: any;
        isDummy: boolean;
    }>;
    launchStageActionWorkflow(attestationName: string, status: 'start' | 'cancel', type: string): Promise<{
        data: any;
        isDummy: boolean;
    }>;
    private transformError;
    launchActionWorkflow(type: ActionAttestationType, operation: ActionOperation, workflowArgs: any): Promise<any>;
    signoffAttestation(type: 'application' | 'entitlement' | 'birthright' | 'privileged' | 'decentralized', owner: string, attestationname: string, payload: {
        items: {
            id: string;
        }[];
    }): Promise<any>;
    /**
     * validateAllWorkflows
     * Non-blocking startup check for all configured Action workflow URLs.
     * Runs sequentially to avoid API storm.
     */
    validateAllWorkflows(): Promise<void>;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
        error?: string;
    }>;
}
export declare const iamService: IAMService;
export default iamService;
//# sourceMappingURL=iam.service.d.ts.map