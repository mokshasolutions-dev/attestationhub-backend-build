"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformStageResponse = transformStageResponse;
function transformStageResponse(responseMap) {
    const items = [];
    const seen = new Set();
    for (const [name, rawItems] of Object.entries(responseMap)) {
        for (const raw of rawItems) {
            // Use a comprehensive key to distinguish granular staging data (application, entitlement, birthright)
            const key = `${name}|${raw.owner}|${raw.application || ''}|${raw.attribute || ''}|${raw.value || ''}|${raw.rolename || ''}|${raw.created || ''}`;
            if (!seen.has(key)) {
                items.push({
                    ...raw,
                    attestationname: name,
                    owner: raw.owner,
                    requester: raw.requester,
                    type: raw.type,
                    signoffstatus: raw.signoffstatus,
                    created: raw.created,
                    // Birthright
                    rolename: raw.rolename,
                    roledisplayname: raw.roledisplayname,
                    roleownerdisplayname: raw.roleownerdisplayname,
                    assignmentcriteria: raw.assignmentcriteria,
                    assignmentrule: raw.assignmentrule,
                    requireditroles: raw.requireditroles,
                    requireditrolesdisplayname: raw.requireditrolesdisplayname,
                    // Application / Entitlement
                    application: raw.application,
                    attribute: raw.attribute,
                    value: raw.value,
                    displayname: raw.displayname,
                    description: raw.description,
                    businessappname: raw.businessappname,
                    accesstype: raw.accesstype,
                    iscertifiable: raw.iscertifiable,
                    isprivaccessrequired: raw.isprivaccessrequired,
                    isrequestable: raw.isrequestable,
                    issensitive: raw.issensitive
                });
                seen.add(key);
            }
        }
    }
    return items;
}
//# sourceMappingURL=staging.transformer.js.map