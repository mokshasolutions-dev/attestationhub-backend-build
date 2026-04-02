import { ActionAttestationType, ActionOperation } from '../config/workflowResolver';
import { TransformedItem, DecentralizedItem } from './detailsTypes';
export { ActionAttestationType, ActionOperation };
/**
 * Common request shape for all action endpoints
 */
export interface ActionRequest {
    owner: string;
    attestationname: string;
    signoff: boolean;
    signoffstatus?: boolean;
    ready?: boolean;
    comments?: string;
    list?: TransformedItem[] | DecentralizedItem[];
}
/**
 * Expected response contract for action endpoints
 */
export interface ActionResponse {
    success: boolean;
    details?: {
        attestationname: string;
        signoffstatus: string;
        signoffdate: string;
    };
}
/**
 * Standard Payload structure for (application, entitlement, birthright, privileged)
 */
export interface StandardActionPayload {
    items: {
        [attestationname: string]: {
            [id: string]: ActionEntity;
        };
    };
}
/**
 * Decentralized Payload structure
 */
export interface DecentralizedActionPayload {
    items: {
        [attestationname: string]: ActionEntity;
    };
}
/**
 * Shared entity for eligibility/mutation logic
 */
export type ActionEntity = TransformedItem | DecentralizedItem;
//# sourceMappingURL=actionTypes.d.ts.map