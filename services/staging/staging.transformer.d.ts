export interface StagingItem {
    attestationname: string;
    owner: string;
    requester?: string;
    type?: string;
    signoffstatus?: string;
    created?: string;
    rolename?: string;
    roledisplayname?: string;
    roleownerdisplayname?: string;
    assignmentcriteria?: string;
    assignmentrule?: string;
    requireditroles?: string;
    requireditrolesdisplayname?: string;
    application?: string;
    attribute?: string;
    value?: string;
    displayname?: string;
    description?: string;
    businessappname?: string;
    accesstype?: string;
    iscertifiable?: string;
    isprivaccessrequired?: string;
    isrequestable?: string;
    issensitive?: string;
    [key: string]: any;
}
export interface StagingResponse {
    items: StagingItem[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    } | null;
}
export declare function transformStageResponse(responseMap: Record<string, any[]>): StagingItem[];
//# sourceMappingURL=staging.transformer.d.ts.map