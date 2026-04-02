export type AttestationChartSummary = {
    pending: number;
    approved: number;
    rejected: number;
    autoclosed: number;
    updated?: number;
    attestationname: string;
};
export type DecentralizedChartSummary = {
    completed: number;
    notCompleted: number;
};
export type AttestationDetails = {
    owner: string;
    created?: string;
    signoffstatus: string | null;
    signoffdate: string | null;
    duedate?: string | null;
};
export interface IQuestionnaire {
    QuestionId: string;
    QID: string;
    QOId: string;
    FreeText: string | null;
}
export interface JdbcAutomationConfig {
    tables_involved?: string | null;
    status_message?: string | null;
    qa_schema_name?: string | null;
    dev_database_server?: string | null;
    sql_grant_access?: string | null;
    created_at?: string | null;
    prod_schema_name?: string | null;
    database_type?: string | null;
    sql_fetch_entitlements?: string | null;
    application_name?: string | null;
    filepath?: string | null;
    dev_service_account?: string | null;
    updated_at?: string | null;
    qa_database_port?: number | null;
    sql_disable_user?: string | null;
    dev_database_port?: number | null;
    owner?: string | null;
    prod_database_server?: string | null;
    sql_delete_user?: string | null;
    decentralized_id?: number | null;
    sql_insert_user?: string | null;
    sql_update_user?: string | null;
    sql_fetch_user_accounts?: string | null;
    qa_database_server?: string | null;
    jdbc_config_id?: number | null;
    qa_service_account?: string | null;
    prod_service_account?: string | null;
    dev_schema_name?: string | null;
    provisioning_supported?: boolean | null;
    prod_database_port?: number | null;
    sql_remove_access?: string | null;
    status?: string | null;
}
export type RawDecentralizedItem = {
    id?: string;
    attestationname?: string;
    owner: string;
    application: string | null;
    signoffstatus: string | null;
    created?: string;
    signoffdate?: string;
    decisiondate?: string;
    duedate?: string;
    modified?: string;
    workitem?: string;
    businessappname?: string | null;
    questionnaire?: IQuestionnaire[];
    jdbcAutomationConfig?: JdbcAutomationConfig[] | null;
    requester?: string | null;
    action?: string | null;
    completioncomments?: string | null;
    attribute?: string | null;
    value?: string | null;
    displayname?: string | null;
    description?: string | null;
    accessid?: string | null;
    accountname?: string | null;
    commonaccess?: string | null;
    source?: string | null;
    appid?: string | null;
    filepathMFA?: string | null;
    filepathIGA?: string | null;
    filepathSSO?: string | null;
    filepathPAM?: string | null;
};
export type DecentralizedItem = {
    id: number;
    attestationname: string;
    owner: string;
    application: string | null;
    signoffstatus: string | null;
    created?: string;
    signoffdate: string | null;
    decisiondate?: string;
    duedate?: string;
    modified?: string;
    workitem?: string;
    requester?: string;
    type?: string;
    action?: string | null;
    completioncomments?: string | null;
    questionnaire: IQuestionnaire[];
    jdbcAutomationConfig?: JdbcAutomationConfig[] | null;
    attribute?: string | null;
    value?: string | null;
    displayname?: string | null;
    description?: string | null;
    accessid?: string | null;
    accountname?: string | null;
    businessappname?: string | null;
    commonaccess?: string | null;
    source?: string | null;
    appid?: string | null;
    filepathMFA?: string | null;
    filepathIGA?: string | null;
    filepathSSO?: string | null;
    filepathPAM?: string | null;
};
export type BaseTransformedItem = {
    id: number;
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
export type BirthrightItem = BaseTransformedItem & {
    roledisplayname?: string;
    assignmentcriteria?: string;
    roleownerdisplayname?: string;
    requireditrolesdisplayname?: string;
    roleName?: string;
    requireditroles?: string;
    businessappname?: string | null;
};
export type PrivilegedItem = BaseTransformedItem & {
    source?: string;
    commonaccess?: string;
    accountname?: string;
    displayname?: string;
    appid?: string;
    attribute?: string;
    value?: string;
    businessappname?: string;
};
export type ApplicationItem = BaseTransformedItem & {
    displayname?: string;
    attribute?: string;
    value?: string;
    businessappname?: string | null;
};
export type EntitlementItem = BaseTransformedItem & {
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
export type TransformedItem = BirthrightItem | PrivilegedItem | ApplicationItem | EntitlementItem;
export type BirthrightAttestationResponse = {
    chart: AttestationChartSummary;
    details: AttestationDetails;
    items: BirthrightItem[];
};
export type PrivilegedAttestationResponse = {
    chart: AttestationChartSummary;
    details: AttestationDetails;
    items: PrivilegedItem[];
};
export type ApplicationAttestationResponse = {
    chart: AttestationChartSummary;
    details: AttestationDetails;
    items: ApplicationItem[];
};
export type EntitlementAttestationResponse = {
    chart: AttestationChartSummary;
    details: AttestationDetails;
    items: EntitlementItem[];
};
export type DecentralizedAttestationResponse = {
    chart: DecentralizedChartSummary;
    details: AttestationDetails;
    items: DecentralizedItem[];
};
export type AllAttestationResponse = BirthrightAttestationResponse | PrivilegedAttestationResponse | ApplicationAttestationResponse | EntitlementAttestationResponse | DecentralizedAttestationResponse;
export type PaginatedData = {
    isReadyForSignoff?: boolean;
    items: TransformedItem[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
};
export type DecentralizedData = {
    items: DecentralizedItem[];
    pagination: null;
};
export type AttestationData = PaginatedData | DecentralizedData;
export type AttestationResponse = {
    chart: AttestationChartSummary | DecentralizedChartSummary;
    details: AttestationDetails;
    data: AttestationData;
};
//# sourceMappingURL=detailsTypes.d.ts.map