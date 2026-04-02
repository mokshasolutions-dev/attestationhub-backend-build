import { AttestationChartSummary, AttestationDetails, BirthrightItem, PrivilegedItem, ApplicationItem, EntitlementItem, BirthrightAttestationResponse, PrivilegedAttestationResponse, ApplicationAttestationResponse, EntitlementAttestationResponse, DecentralizedAttestationResponse, RawDecentralizedItem } from "../../types/detailsTypes";
export { RawDecentralizedItem };
export type AttestationType = 'birthright' | 'entitlement' | 'application' | 'privileged' | 'decentralized';
type BaseRawItem = {
    id: string;
    attestationname: string;
    owner: string;
    requester: string;
    application: string | null;
    type: string;
    signoffstatus: string | null;
    action: string | null;
    completioncomments?: string | null;
    created?: string;
    signoffdate: string | null;
    decisiondate?: string;
    duedate?: string;
    modified?: string;
    description?: string | null;
    accessid?: string;
    workitem?: string;
};
export type RawBirthrightItem = BaseRawItem & {
    roleName?: string;
    roledisplayname?: string;
    assignmentcriteria?: string;
    roleownerdisplayname?: string;
    requireditrolesdisplayname?: string;
    requireditroles?: string;
    businessappname?: string | null;
};
export type RawPrivilegedItem = BaseRawItem & {
    source?: string;
    commonaccess?: string;
    accountname?: string;
    displayname?: string;
    appid?: string;
    attribute?: string;
    value?: string;
    businessappname?: string;
};
export type RawApplicationItem = BaseRawItem & {
    displayname?: string;
    attribute?: string;
    value?: string;
    businessappname?: string | null;
};
export type RawEntitlementItem = BaseRawItem & {
    isprivileged?: string;
    iscertifiable?: string;
    attribute?: string;
    value?: string;
    businessappname?: string;
    admaccessrequired?: string;
    isrequestable?: string;
    issensitive?: string;
    displayname?: string | null;
    appid?: string;
    accesstype?: string;
};
export type RawSailPointItem = RawBirthrightItem | RawPrivilegedItem | RawApplicationItem | RawEntitlementItem | RawDecentralizedItem;
export interface SailPointDetailResponse {
    attributes?: {
        responseMap?: Record<string, RawSailPointItem[] | unknown>;
    };
    workflowArgs?: Record<string, RawDecentralizedItem>;
}
export type ActiveAttestationResponse = {
    chart: AttestationChartSummary;
    details: AttestationDetails;
    items: (BirthrightItem | PrivilegedItem | ApplicationItem | EntitlementItem)[];
};
/**
 * Aggregate chart counts from items
 */
export declare const aggregateChartCounts: (items: {
    action: string | null;
    signoffstatus: string | null;
}[], attestationType: string) => Omit<AttestationChartSummary, "attestationname">;
/**
 * Extract details from first item
 */
/**
 * Extract details from first item with optional status override
 */
export declare const extractDetails: (firstItem: {
    owner: string;
    created?: string;
    signoffstatus: string | null;
    signoffdate: string | null;
    duedate?: string | null;
} | undefined, overrideStatus?: string | null) => AttestationDetails;
export declare function transformBirthrightAttestation(responseMap: Record<string, RawBirthrightItem[]>): BirthrightAttestationResponse;
export declare function transformPrivilegedAttestation(responseMap: Record<string, RawPrivilegedItem[]>): PrivilegedAttestationResponse;
export declare function transformApplicationAttestation(responseMap: Record<string, RawApplicationItem[]>): ApplicationAttestationResponse;
export declare function transformEntitlementAttestation(responseMap: Record<string, RawEntitlementItem[]>): EntitlementAttestationResponse;
export declare function transformDecentralizedAttestation(workflowArgs: Record<string, RawDecentralizedItem>): DecentralizedAttestationResponse;
/**
 * Main transformer that dispatches to the appropriate type-specific transformer
 * based on attestationType parameter
 */
export declare function transformActiveAttestation(responseMap: Record<string, RawSailPointItem[]>, attestationType: AttestationType): ActiveAttestationResponse | DecentralizedAttestationResponse;
//# sourceMappingURL=details.transformer.d.ts.map