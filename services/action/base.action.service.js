"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseActionService = void 0;
const error_middleware_1 = require("../../middleware/error.middleware");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const iam_service_1 = __importDefault(require("../iam/iam.service"));
const details_cache_1 = require("../details/details.cache");
const details_transformer_1 = require("../details/details.transformer");
const base_service_1 = require("../base.service");
const config_1 = require("../../config");
const redis_service_1 = __importDefault(require("../redis/redis.service"));
/**
 * SailPoint date format: yyyy-MM-dd HH:mm:ss
 * Handles: ISO strings, Unix timestamps (string or number), and already-formatted dates
 */
function formatSailPointDate(input) {
    // Handle all falsy values and empty strings
    if (input === null || input === undefined || input === '')
        return null;
    // If already in SailPoint format (yyyy-MM-dd HH:mm:ss), return as-is
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(input)) {
        return input;
    }
    // Handle Unix timestamps (as string or number)
    let d;
    if (typeof input === 'string' && /^\d+$/.test(input)) {
        // String that looks like a timestamp
        d = new Date(parseInt(input, 10));
    }
    else if (typeof input === 'number') {
        // Numeric timestamp
        d = new Date(input);
    }
    else {
        // Try parsing as ISO string or other format
        d = new Date(input);
    }
    // Check if date is invalid
    if (isNaN(d.getTime())) {
        console.warn(`Invalid date format received: "${input}"`);
        return null;
    }
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
class BaseActionService extends base_service_1.BaseService {
    constructor(serviceName) {
        super(serviceName);
    }
    checkEligibility(items, type, isSignoff = false) {
        // If signoff is requested without items, we'll use cached items, so we don't throw yet.
        if (!items || items.length === 0) {
            if (isSignoff)
                return [];
            throw new error_middleware_1.AppError('No items found for processing', 400, 'NO_ITEMS_FOUND');
        }
        const eligible = [];
        for (const item of items) {
            const action = item.action?.toLowerCase();
            const signoffStatus = item.signoffstatus?.toLowerCase();
            if (isSignoff &&
                (signoffStatus === 'completed' || signoffStatus === 'autoclosed')) {
                continue;
            }
            if (!isSignoff && signoffStatus === 'autoclosed') {
                continue;
            }
            // if (isSignoff) {
            //   if (!action || action === 'pending') {
            //     throw new AppError(
            //       `Item ${item.id} cannot be signed off with pending action`,
            //       400,
            //       'ELIGIBILITY_FAILED'
            //     );
            //   }
            //   if (action !== 'approved' && action !== 'rejected') {
            //     throw new AppError(
            //       `Item ${item.id} has invalid action: ${action}`,
            //       400,
            //       'ELIGIBILITY_FAILED'
            //     );
            //   }
            // }
            eligible.push(item);
        }
        if (eligible.length === 0) {
            throw new error_middleware_1.AppError('No eligible items found for processing', 400, 'NO_ELIGIBLE_ITEMS');
        }
        return eligible;
    }
    async refreshCacheAfterAction(owner, type, attestationname) {
        // 1. Explicitly invalidating old cache before fresh fetch
        // We try to find workitem id from cache first to delete its entry too
        const { data: cached } = await (0, details_cache_1.getAuthoritativeDetails)(owner, type, attestationname);
        const workItemId = cached?.items?.[0]?.workitem;
        if (workItemId) {
            await (0, details_cache_1.deleteDetailsCache)(owner, type, String(workItemId), attestationname);
        }
        else {
            await (0, details_cache_1.deleteDetailsCache)(owner, type, attestationname);
        }
        // 1.1 Invalidate all List API caches for this type to stay in sync
        if (config_1.Config.REDIS_ENABLED) {
            const listPattern = `list:*:${type}`;
            await redis_service_1.default.deletePattern(listPattern);
            logger_utils_1.default.info('List caches invalidated after action', { type, listPattern });
        }
        // 2. Fetch fresh truth
        const { data: fresh, isDummy } = await (0, details_cache_1.fetchAndTransformDetails)(owner, type, attestationname);
        // If API failed and it fell back to dummy data, throw error as requested
        if (isDummy) {
            throw new error_middleware_1.AppError('Failed to refresh data from SailPoint after action', 502, 'SAILPOINT_REFRESH_FAILED');
        }
        // 3. Update cache with fresh data (AUTHORITATIVE)
        await (0, details_cache_1.updateDetailsCache)(owner, type, attestationname, fresh, false, true);
        const firstItem = fresh.items?.[0];
        return {
            signoffstatus: firstItem?.signoffstatus ?? 'Completed',
            signoffdate: firstItem?.signoffdate,
        };
    }
    async processAction(input) {
        const { type, owner, attestationname, list, isSignoff, comments, signoffstatus } = input;
        const effectiveIsSignoff = isSignoff || signoffstatus === true;
        const operation = effectiveIsSignoff ? 'signoff' : 'save';
        logger_utils_1.default.error(`🚨 INCOMING_ACTION_REQUEST (${operation.toUpperCase()}) 🚨\n` +
            JSON.stringify({ type, owner, attestationname, itemCount: list?.length ?? 0, list }, null, 2));
        logger_utils_1.default.info('ACTION_REQUEST_RECEIVED', {
            type,
            operation,
            attestationname,
            owner,
            itemCount: list?.length ?? 0,
        });
        // 1. Fetch current truth from cache for merging and status calculation
        const { data: cached } = await (0, details_cache_1.getAuthoritativeDetails)(owner, type, attestationname);
        // 2. SIGNOFF PRE-CHECK: Verify no pending decisions exist in cache
        if (isSignoff) {
            const hasPendingDecisions = cached.items?.some((item) => item.action?.toLowerCase() === 'pending');
            if (hasPendingDecisions) {
                throw new error_middleware_1.AppError('Cannot sign off while pending decisions exist', 400, 'SIGNOFF_NOT_ALLOWED');
            }
        }
        // 3. Fallback to cached items if list is empty during signoff
        const effectiveList = (effectiveIsSignoff && (!list || list.length === 0)) ? cached.items : list;
        let eligibleItems = this.checkEligibility(effectiveList, type, effectiveIsSignoff);
        if (!effectiveIsSignoff) {
            eligibleItems = eligibleItems.filter(i => i.action && i.action.toLowerCase() !== 'pending');
        }
        // 4. Calculate Merged State and Overall Status
        const mergedItems = cached.items?.map((cachedItem) => {
            const updated = effectiveList.find((i) => String(i.id) === String(cachedItem.id));
            if (updated) {
                return {
                    ...cachedItem,
                    action: updated.action,
                    decisiondate: updated.decisiondate,
                    signoffdate: updated.signoffdate || (effectiveIsSignoff ? Date.now() : cachedItem.signoffdate),
                    signoffstatus: effectiveIsSignoff ? 'Completed' : 'Ready',
                };
            }
            return cachedItem;
        }) ?? cached.items;
        // Overall signofstatus is only 'ready' when ALL items are actioned
        const allItemsActioned = mergedItems.every((item) => item.action && item.action.toLowerCase() !== 'pending');
        let overallStatus = 'Pending';
        if (effectiveIsSignoff) {
            overallStatus = 'Completed';
        }
        else if (allItemsActioned) {
            overallStatus = 'Ready';
        }
        // 4. Update Cache (Optimistic)
        const itemsToAggregate = mergedItems || [];
        const recalculatedChart = (0, details_transformer_1.aggregateChartCounts)(itemsToAggregate, type);
        const recalculatedDetails = (0, details_transformer_1.extractDetails)(itemsToAggregate[0]);
        const mergedData = {
            ...cached,
            chart: {
                ...(cached.chart || {}),
                ...recalculatedChart,
            },
            details: {
                ...(cached.details || {}),
                ...recalculatedDetails,
                signoffstatus: overallStatus,
            },
            items: mergedItems,
        };
        await (0, details_cache_1.updateDetailsCache)(owner, type, attestationname, mergedData, false, true);
        // 5. Build SailPoint Payload
        const items = {
            [attestationname]: {},
        };
        const attestationItems = items[attestationname];
        for (const baseItem of eligibleItems) {
            const item = baseItem;
            const forceNumber = (val) => {
                if (val === null || val === undefined || val === '')
                    return null;
                const num = Number(val);
                return isNaN(num) ? val : num;
            };
            const updatedItem = {
                id: Number(item.id),
                attestationname: item.attestationname,
                owner: item.owner,
                requester: item.requester,
                application: item.application ?? null,
                type: item.type ?? null,
                attribute: item.attribute ?? null,
                value: item.value ?? null,
                displayname: item.displayname ?? null,
                signoffstatus: effectiveIsSignoff ? 'Completed' : 'Ready',
                action: item.action,
                completioncomments: item.completioncomments ?? null,
                created: type === 'entitlement' ? forceNumber(item.created) : item.created,
                signoffdate: type === 'entitlement' ? forceNumber(item.signoffdate || (effectiveIsSignoff ? Date.now() : null)) : item.signoffdate,
                decisiondate: type === 'entitlement' ? forceNumber(item.decisiondate) : item.decisiondate,
                duedate: type === 'entitlement' ? forceNumber(item.duedate) : item.duedate,
                description: item.description ?? null,
                accessid: item.accessid ?? null,
                modified: type === 'entitlement' ? forceNumber(item.modified) : item.modified,
                workitem: item.workitem ? Number(item.workitem) : null,
                businessappname: item.businessappname ?? null,
            };
            // Entitlement specific extra fields
            if (type === 'entitlement') {
                updatedItem.entowner = null;
                updatedItem.accesstype = item.accesstype ?? null;
                updatedItem.isprivileged = item.isprivileged ? String(item.isprivileged) : null;
                updatedItem.iscertifiable = item.iscertifiable ? String(item.iscertifiable) : null;
                updatedItem.isrequestable = item.isrequestable ? String(item.isrequestable) : null;
                updatedItem.issensitive = item.issensitive ? String(item.issensitive) : null;
                updatedItem.admaccessrequired = item.admaccessrequired ? String(item.admaccessrequired) : null;
                updatedItem.appid = item.appid ?? null;
            }
            // Privileged specific extra fields
            if (type === 'privileged') {
                // Privileged uses string id, not number
                updatedItem.id = String(item.id);
                // Privileged uses display_name (underscore), not displayname
                updatedItem.display_name = updatedItem.displayname ?? null;
                delete updatedItem.displayname;
                // Extra fields required by SailPoint for privileged
                updatedItem.appid = item.appid ?? null;
                updatedItem.attestationid = null;
                updatedItem.accountname = item.accountname ?? null;
                updatedItem.commonaccess = item.commonaccess ?? null;
                // Privileged does not send workitem
                delete updatedItem.workitem;
            }
            // Use accessid as key for privileged, numeric id for others
            const itemKey = type === 'privileged'
                ? (item.accessid ?? String(Number(item.id)))
                : String(Number(item.id));
            attestationItems[itemKey] = updatedItem;
            // if (effectiveIsSignoff) {
            //   logger.error(
            //     `🎯 SIGNOFF_ITEM_CONSTRUCTED [${item.id}] 🎯\n` +
            //     JSON.stringify(updatedItem, null, 2)
            //   );
            // }
        }
        // 6. Launch SailPoint Workflow
        const workflowArgs = {
            owner,
            attestationType: type.charAt(0).toUpperCase() + type.slice(1),
            attestationName: null,
            comments: comments ?? null,
            signofstatus: overallStatus,
            itemsList: null,
            items,
        };
        // logger.error(
        //   '🚨 FINAL_PAYLOAD_TO_SAILPOINT 🚨\n' +
        //   JSON.stringify(workflowArgs, null, 2)
        // );
        // generate json file
        // fs.writeFileSync(
        //   `./workflowArgs_${Date.now()}.json`,
        //   JSON.stringify(workflowArgs, null, 2)
        // );
        const iamResponse = await iam_service_1.default.launchActionWorkflow(type, operation, workflowArgs);
        const hasErrors = Array.isArray(iamResponse?.errors)
            ? iamResponse.errors.length > 0
            : iamResponse?.errors != null;
        if (iamResponse?.failure === true || hasErrors) {
            throw new error_middleware_1.AppError('SailPoint rejected the action workflow', 502, 'SAILPOINT_ACTION_FAILED', true, iamResponse);
        }
        // 7. Refresh cache from truth (SailPoint) — but preserve our computed status
        try {
            await this.refreshCacheAfterAction(owner, type, attestationname);
        }
        catch (err) {
            // Non-fatal: optimistic cache is already correct
            logger_utils_1.default.warn('Background cache refresh failed, using optimistic cache', { err });
        }
        return {
            success: true,
            data: {
                ...mergedData,
                details: {
                    ...(mergedData.details || {}),
                    signoffstatus: overallStatus,
                },
            },
        };
    }
}
exports.BaseActionService = BaseActionService;
//# sourceMappingURL=base.action.service.js.map