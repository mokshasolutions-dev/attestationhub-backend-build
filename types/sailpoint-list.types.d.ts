export interface SailPointListResponse {
    status: string | null;
    requestID: string;
    warnings: unknown;
    errors: unknown;
    retryWait: number;
    metaData: unknown;
    attributes: {
        responseMap: Record<string, string | null>;
    };
    workflowArgs?: Record<string, string | null>;
    retry: boolean;
    failure: boolean;
    complete: boolean;
    success: boolean;
}
//# sourceMappingURL=sailpoint-list.types.d.ts.map