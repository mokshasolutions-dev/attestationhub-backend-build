"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveActionWorkflowUrl = resolveActionWorkflowUrl;
const actionWorkflowUrls_1 = require("./actionWorkflowUrls");
const index_1 = require("./index");
/**
 * resolveActionWorkflowUrl
 * Builds the full SailPoint Action workflow URL using:
 * IAM_BASE_URL + ACTION_*_API (path)
 */
function resolveActionWorkflowUrl(type) {
    const baseUrl = index_1.Config.IAM_BASE_URL;
    const path = actionWorkflowUrls_1.ACTION_WORKFLOW_URLS[type];
    if (!baseUrl || baseUrl.trim() === '') {
        throw new Error('IAM_BASE_URL is not configured in environment variables.');
    }
    if (!path || path.trim() === '') {
        throw new Error(`SailPoint workflow path for action type '${type}' is not configured in environment variables.`);
    }
    // Normalize to avoid double or missing slashes
    const normalizedBase = baseUrl.replace(/\/$/, '');
    const normalizedPath = path.replace(/^\//, '');
    return `${normalizedBase}/${normalizedPath}`;
}
//# sourceMappingURL=workflowResolver.js.map