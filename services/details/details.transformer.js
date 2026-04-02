"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDetails = exports.aggregateChartCounts = void 0;
exports.transformBirthrightAttestation = transformBirthrightAttestation;
exports.transformPrivilegedAttestation = transformPrivilegedAttestation;
exports.transformApplicationAttestation = transformApplicationAttestation;
exports.transformEntitlementAttestation = transformEntitlementAttestation;
exports.transformDecentralizedAttestation = transformDecentralizedAttestation;
exports.transformActiveAttestation = transformActiveAttestation;
function deriveEntitlementAction(item) {
    if (!item.decisiondate)
        return 'pending';
    if (item.action?.toLowerCase() === 'approved')
        return 'approved';
    return 'rejected';
}
/**
 * Normalize action string to chart bucket key
 */
const normalizeAction = (action, signoffstatus, attestationType) => {
    if (signoffstatus?.toLowerCase() === 'autoclosed') {
        return 'autoclosed';
    }
    if (!action)
        return 'pending';
    const normalized = action.toLowerCase();
    if (normalized === 'updated' && attestationType === 'entitlement') {
        return 'updated';
    }
    switch (normalized) {
        case 'approved':
            return 'approved';
        case 'rejected':
        case 'reject':
            return 'rejected';
        case 'autoclosed':
            return 'autoclosed';
        default:
            return 'pending';
    }
};
/**
 * Create empty response for cases with no data
 */
const createEmptyResponse = () => ({
    chart: {
        pending: 0,
        approved: 0,
        rejected: 0,
        autoclosed: 0,
        attestationname: '',
    },
    details: {
        owner: '',
        signoffstatus: null,
        duedate: null,
    },
    items: [],
});
/**
 * Create base item from raw data (common fields for all types)
 */
const createBaseItem = (raw) => ({
    id: Number(raw.id),
    attestationname: raw.attestationname,
    owner: raw.owner,
    requester: raw.requester,
    application: raw.application,
    type: raw.type,
    signoffstatus: raw.signoffstatus,
    action: raw.action,
    completioncomments: raw.completioncomments,
    created: raw.created,
    signoffdate: raw.signoffdate,
    decisiondate: raw.decisiondate,
    duedate: raw.duedate,
    modified: raw.modified,
    description: raw.description,
    accessid: raw.accessid,
    workitem: raw.workitem,
});
/**
 * Aggregate chart counts from items
 */
const aggregateChartCounts = (items, attestationType) => {
    const chartCounts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        autoclosed: 0,
    };
    if (attestationType === 'entitlement') {
        chartCounts.updated = 0;
    }
    for (const item of items) {
        const bucket = normalizeAction(item.action, item.signoffstatus, attestationType);
        chartCounts[bucket]++;
    }
    return chartCounts;
};
exports.aggregateChartCounts = aggregateChartCounts;
/**
 * Extract details from first item
 */
/**
 * Extract details from first item with optional status override
 */
const extractDetails = (firstItem, overrideStatus) => {
    return firstItem
        ? {
            owner: firstItem.owner,
            created: firstItem.created,
            signoffstatus: overrideStatus !== undefined ? overrideStatus : firstItem.signoffstatus,
            signoffdate: firstItem.signoffdate,
            duedate: firstItem.duedate,
        }
        : {
            owner: '',
            signoffstatus: null,
            signoffdate: null,
            duedate: null,
        };
};
exports.extractDetails = extractDetails;
/**
 * Calculate overall attestation status based on items and pending count
 */
const calculateOverallStatus = (items, pendingCount) => {
    const firstItemStatus = items[0]?.signoffstatus ?? null;
    const normalizedStatus = firstItemStatus?.toLowerCase();
    if (normalizedStatus === "ready") {
        return "Pending";
    }
    return firstItemStatus;
};
// ============================================
// BIRTHRIGHT ATTESTATION TRANSFORMER
// ============================================
function transformBirthrightAttestation(responseMap) {
    const entries = Object.entries(responseMap);
    if (entries.length === 0 || !entries[0]) {
        return createEmptyResponse();
    }
    const [attestationName, rawItems] = entries[0];
    const items = rawItems.map((raw) => ({
        ...createBaseItem(raw),
        roledisplayname: raw.roledisplayname,
        assignmentcriteria: raw.assignmentcriteria,
        roleownerdisplayname: raw.roleownerdisplayname,
        requireditrolesdisplayname: raw.requireditrolesdisplayname,
        roleName: raw.roleName,
        requireditroles: raw.requireditroles,
        businessappname: raw.businessappname,
    }));
    const chartCounts = (0, exports.aggregateChartCounts)(items, 'birthright');
    const overallStatus = calculateOverallStatus(items, chartCounts.pending);
    const details = (0, exports.extractDetails)(items[0], overallStatus);
    return {
        chart: {
            ...chartCounts,
            attestationname: attestationName,
        },
        details,
        items,
    };
}
// ============================================
// PRIVILEGED ATTESTATION TRANSFORMER
// ============================================
function transformPrivilegedAttestation(responseMap) {
    const entries = Object.entries(responseMap);
    if (entries.length === 0 || !entries[0]) {
        return createEmptyResponse();
    }
    const [attestationName, rawItems] = entries[0];
    const items = rawItems.map((raw) => ({
        ...createBaseItem(raw),
        source: raw.source,
        commonaccess: raw.commonaccess,
        accountname: raw.accountname,
        displayname: raw.displayname,
        appid: raw.appid,
        attribute: raw.attribute,
        value: raw.value,
        businessappname: raw.businessappname,
    }));
    const chartCounts = (0, exports.aggregateChartCounts)(items, 'privileged');
    const overallStatus = calculateOverallStatus(items, chartCounts.pending);
    const details = (0, exports.extractDetails)(items[0], overallStatus);
    return {
        chart: {
            ...chartCounts,
            attestationname: attestationName,
        },
        details,
        items,
    };
}
// ============================================
// APPLICATION ATTESTATION TRANSFORMER
// ============================================
function transformApplicationAttestation(responseMap) {
    const entries = Object.entries(responseMap);
    if (entries.length === 0 || !entries[0]) {
        return createEmptyResponse();
    }
    const [attestationName, rawItems] = entries[0];
    const items = rawItems.map((raw) => ({
        ...createBaseItem(raw),
        displayname: raw.displayname,
        attribute: raw.attribute,
        value: raw.value,
        businessappname: raw.businessappname,
    }));
    const chartCounts = (0, exports.aggregateChartCounts)(items, 'application');
    const overallStatus = calculateOverallStatus(items, chartCounts.pending);
    const details = (0, exports.extractDetails)(items[0], overallStatus);
    return {
        chart: {
            ...chartCounts,
            attestationname: attestationName,
        },
        details,
        items,
    };
}
// ============================================
// ENTITLEMENT ATTESTATION TRANSFORMER
// ============================================
function transformEntitlementAttestation(responseMap) {
    const entry = Object.entries(responseMap)[0];
    // Hard safety: no attestation data
    if (!entry) {
        return {
            chart: {
                pending: 0,
                approved: 0,
                rejected: 0,
                autoclosed: 0,
                attestationname: '',
            },
            details: {
                owner: '',
                signoffstatus: null,
                signoffdate: null,
                duedate: null,
            },
            items: [],
        };
    }
    const [attestationName, rawItems] = entry;
    const items = rawItems.map((raw) => ({
        ...createBaseItem(raw),
        isprivileged: raw.isprivileged,
        iscertifiable: raw.iscertifiable,
        attribute: raw.attribute,
        value: raw.value,
        businessappname: raw.businessappname,
        admaccessrequired: raw.admaccessrequired,
        isrequestable: raw.isrequestable,
        issensitive: raw.issensitive,
        displayname: raw.displayname,
        appid: raw.appid,
        accesstype: raw.accesstype,
    }));
    const chartCounts = (0, exports.aggregateChartCounts)(items, 'entitlement');
    const overallStatus = calculateOverallStatus(items, chartCounts.pending);
    const details = (0, exports.extractDetails)(items[0], overallStatus);
    return {
        chart: {
            ...chartCounts,
            attestationname: attestationName,
        },
        details,
        items,
    };
}
// ============================================
// DECENTRALIZED ATTESTATION TRANSFORMER
// ============================================
/**
 * Create empty decentralized response
 */
const createEmptyDecentralizedResponse = () => ({
    chart: {
        completed: 0,
        notCompleted: 0,
    },
    details: {
        owner: '',
        signoffstatus: null,
        signoffdate: null,
        duedate: null,
    },
    items: [],
});
function transformDecentralizedAttestation(workflowArgs) {
    const entries = Object.entries(workflowArgs);
    if (entries.length === 0) {
        return createEmptyDecentralizedResponse();
    }
    const items = entries.map(([name, raw], index) => ({
        id: Number(raw.id ?? index + 1),
        attestationname: raw.attestationname ?? name,
        owner: raw.owner,
        application: raw.application ?? null,
        signoffstatus: raw.signoffstatus ?? null,
        created: raw.created,
        signoffdate: raw.signoffdate ?? null,
        decisiondate: raw.decisiondate,
        duedate: raw.duedate,
        modified: raw.modified,
        workitem: raw.workitem,
        requester: raw.requester ?? undefined,
        action: raw.action ?? null,
        questionnaire: Array.isArray(raw.questionnaire)
            ? raw.questionnaire.map((q) => ({
                QuestionId: q.QuestionId || q.questionId || '',
                QID: q.QID || q.qid || null,
                QOId: q.QOId || q.qoid || null,
                FreeText: q.FreeText || q.freeText || q.freetext || null,
            }))
            : [],
        jdbcAutomationConfig: raw.jdbcAutomationConfig ?? null,
        // Read-only / SailPoint fields
        attribute: raw.attribute ?? null,
        value: raw.value ?? null,
        displayname: raw.displayname ?? null,
        description: raw.description ?? null,
        accessid: raw.accessid ?? null,
        accountname: raw.accountname ?? null,
        businessappname: raw.businessappname ?? null,
        commonaccess: raw.commonaccess ?? null,
        source: raw.source ?? null,
        appid: raw.appid ?? null,
        // File paths
        filepathMFA: raw.filepathMFA ?? null,
        filepathIGA: raw.filepathIGA ?? null,
        filepathSSO: raw.filepathSSO ?? null,
        filepathPAM: raw.filepathPAM ?? null,
    }));
    // Aggregate chart counts for decentralized (completed vs not completed)
    let completed = 0;
    let notCompleted = 0;
    for (const item of items) {
        if (item.signoffstatus?.toLowerCase() === 'completed') {
            completed++;
        }
        else {
            notCompleted++;
        }
    }
    const firstItem = items[0];
    const details = (0, exports.extractDetails)(firstItem);
    return {
        chart: {
            completed,
            notCompleted,
        },
        details,
        items,
    };
}
// ============================================
// MAIN DISPATCHER FUNCTION
// ============================================
/**
 * Main transformer that dispatches to the appropriate type-specific transformer
 * based on attestationType parameter
 */
function transformActiveAttestation(responseMap, attestationType) {
    switch (attestationType) {
        case 'birthright':
            return transformBirthrightAttestation(responseMap);
        case 'privileged':
            return transformPrivilegedAttestation(responseMap);
        case 'application':
            return transformApplicationAttestation(responseMap);
        case 'entitlement':
            return transformEntitlementAttestation(responseMap);
        case 'decentralized':
            // For decentralized, the input should be workflowArgs (Record<string, RawDecentralizedItem>)
            return transformDecentralizedAttestation(responseMap);
        default:
            // Default to application for unknown types
            return transformApplicationAttestation(responseMap);
    }
}
//# sourceMappingURL=details.transformer.js.map