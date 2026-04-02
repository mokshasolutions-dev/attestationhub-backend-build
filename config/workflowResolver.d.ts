import { ActionAttestationType } from './actionWorkflowUrls';
export type ActionOperation = 'save' | 'signoff';
export { ActionAttestationType };
/**
 * resolveActionWorkflowUrl
 * Builds the full SailPoint Action workflow URL using:
 * IAM_BASE_URL + ACTION_*_API (path)
 */
export declare function resolveActionWorkflowUrl(type: ActionAttestationType): string;
//# sourceMappingURL=workflowResolver.d.ts.map