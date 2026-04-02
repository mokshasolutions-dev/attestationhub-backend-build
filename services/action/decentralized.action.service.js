"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decentralizedActionService = void 0;
const base_action_service_1 = require("./base.action.service");
const error_middleware_1 = require("../../middleware/error.middleware");
const iam_service_1 = __importDefault(require("../iam/iam.service"));
const details_cache_1 = require("../details/details.cache");
const details_transformer_1 = require("../details/details.transformer");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const fileStorage_service_1 = require("../storage/fileStorage.service");
class DecentralizedActionService extends base_action_service_1.BaseActionService {
    constructor() {
        super('DecentralizedActionService');
    }
    /**
     * Universal helper for Decentralized actions (Save/Signoff)
     */
    async executeDecentralizedAction(input) {
        const { owner, attestationname, list, operation, comments } = input;
        const isSignoff = operation === 'signoff';
        // 1. Fetch current truth from cache for merging and status calculation
        const { data: cached } = await (0, details_cache_1.getAuthoritativeDetails)(owner, 'decentralized', attestationname);
        const decentralizedItems = (cached.items || []);
        // 2. Build items map for workflowArgs
        const items = {};
        // 3. Fallback to cached items if list is empty during signoff
        const effectiveList = (isSignoff && (!list || list?.length === 0)) ? decentralizedItems : list;
        // We only process the items provided in the list (usually just one for decentralized)
        // but we merge with cached state for read-only fields.
        for (const incomingItem of effectiveList) {
            const dItem = incomingItem;
            const cachedItem = decentralizedItems.find(i => String(i.id) === String(dItem.id));
            // Granular Questionnaire Merge (Prevents losing questions if frontend sends partial list)
            const qMap = new Map();
            const cachedQ = cachedItem?.questionnaire || [];
            const incomingQ = dItem.questionnaire || [];
            cachedQ.forEach(q => {
                const qid = q.QuestionId || q.questionId;
                if (qid)
                    qMap.set(String(qid), q);
            });
            incomingQ.forEach(q => {
                const qid = q.QuestionId || q.questionId;
                if (qid)
                    qMap.set(String(qid), q);
            });
            const mergedQuestionnaire = Array.from(qMap.values()).map(q => ({
                QuestionId: q.QuestionId || q.questionId ? String(q.QuestionId || q.questionId) : '',
                QID: q.QID || q.qid || null,
                QOId: q.QOId || q.qoid ? String(q.QOId || q.qoid) : null,
                FreeText: q.FreeText || q.freeText || q.freetext || null,
            }));
            // Resolve JDBC config
            const jdbcConfig = (dItem.jdbcAutomationConfig && Array.isArray(dItem.jdbcAutomationConfig) && dItem.jdbcAutomationConfig.length > 0)
                ? dItem.jdbcAutomationConfig
                : (cachedItem?.jdbcAutomationConfig || []);
            // GENERATE CSV ONLY ON SIGNOFF AND IF FRONTEND SENT DATA
            if (isSignoff && dItem.jdbcAutomationConfig && Array.isArray(dItem.jdbcAutomationConfig) && dItem.jdbcAutomationConfig.length > 0) {
                try {
                    const jdbcItem = jdbcConfig[0];
                    if (jdbcItem) {
                        const csvContent = this.generateJDBCVersionCSV(jdbcItem);
                        const fileName = `${owner} ${dItem.application || cachedItem?.application || 'App'}_${Date.now()}.csv`;
                        const publicUrl = await fileStorage_service_1.fileStorageService.save(fileName, csvContent);
                        // Update the filepath in the config object with the full URL
                        jdbcItem.filepath = publicUrl;
                        logger_utils_1.default.info(`JDBC CSV generated and uploaded: ${publicUrl}`);
                    }
                }
                catch (err) {
                    logger_utils_1.default.error('Failed to generate JDBC CSV:', err);
                }
            }
            items[attestationname] = {
                id: String(dItem.id),
                attestationname: dItem.attestationname || attestationname,
                application: dItem.application || cachedItem?.application || null,
                appid: dItem.appid || cachedItem?.appid || null,
                workitem: dItem.workitem || cachedItem?.workitem || null,
                owner: dItem.owner || owner,
                requester: dItem.requester || cachedItem?.requester || null,
                action: null, // Always null for decentralized
                signoffstatus: isSignoff ? 'Completed' : (dItem.signoffstatus || cachedItem?.signoffstatus || 'Pending'),
                signoffdate: dItem.signoffdate || cachedItem?.signoffdate || null,
                decisiondate: dItem.decisiondate || cachedItem?.decisiondate || null,
                completioncomments: comments || dItem.completioncomments || cachedItem?.completioncomments || null,
                created: dItem.created || cachedItem?.created || null,
                modified: dItem.modified || null,
                duedate: dItem.duedate || cachedItem?.duedate || null,
                attribute: dItem.attribute || cachedItem?.attribute || null,
                value: dItem.value || cachedItem?.value || null,
                displayname: dItem.displayname || cachedItem?.displayname || null,
                description: dItem.description || cachedItem?.description || null,
                accessid: dItem.accessid || cachedItem?.accessid || null,
                accountname: dItem.accountname || cachedItem?.accountname || null,
                businessappname: dItem.businessappname || cachedItem?.businessappname || null,
                commonaccess: dItem.commonaccess || cachedItem?.commonaccess || null,
                source: dItem.source || cachedItem?.source || null,
                filepathMFA: dItem.filepathMFA || cachedItem?.filepathMFA || null,
                filepathIGA: dItem.filepathIGA || cachedItem?.filepathIGA || null,
                filepathSSO: dItem.filepathSSO || cachedItem?.filepathSSO || null,
                filepathPAM: dItem.filepathPAM || cachedItem?.filepathPAM || null,
                questionnaire: mergedQuestionnaire,
                jdbcAutomationConfig: jdbcConfig,
            };
        }
        const workflowArgs = {
            owner,
            attestationType: 'Decentralized',
            comments: comments || null,
            signoffstatus: isSignoff ? 'Completed' : 'Pending',
            itemsList: null,
            items,
        };
        logger_utils_1.default.error('🚨 FINAL_PAYLOAD_TO_SAILPOINT (Decentralized) 🚨\n' +
            JSON.stringify(workflowArgs, null, 2));
        // generate json file for debugging
        // fs.writeFileSync(
        //   `./workflowArgs_decentralized_${Date.now()}.json`,
        //   JSON.stringify(workflowArgs, null, 2)
        // );
        // 3. Call SailPoint Workflow
        const iamResponse = await iam_service_1.default.launchActionWorkflow('decentralized', operation, workflowArgs);
        const hasErrors = Array.isArray(iamResponse?.errors)
            ? iamResponse.errors.length > 0
            : iamResponse?.errors != null;
        if (iamResponse?.failure === true || hasErrors) {
            throw new error_middleware_1.AppError('SailPoint rejected the decentralized action workflow', 502, 'SAILPOINT_DECENTRALIZED_ACTION_FAILED', true, iamResponse);
        }
        // 4. Collect items for summaries and response
        const finalItems = Object.values(items);
        // 5. Calculate summaries
        let completed = 0;
        let notCompleted = 0;
        for (const item of finalItems) {
            if (item.signoffstatus?.toLowerCase() === 'completed') {
                completed++;
            }
            else {
                notCompleted++;
            }
        }
        const recalculatedChart = { completed, notCompleted };
        const recalculatedDetails = (0, details_transformer_1.extractDetails)(finalItems[0] || cached.items[0]);
        const mergedData = {
            ...cached,
            chart: recalculatedChart,
            details: recalculatedDetails,
            items: finalItems,
        };
        await (0, details_cache_1.updateDetailsCache)(owner, 'decentralized', attestationname, mergedData, false, true);
        // 6. Refresh cache (updates Redis background)
        const freshStatus = await this.refreshCacheAfterAction(owner, 'decentralized', attestationname);
        return {
            success: true,
            chart: recalculatedChart,
            details: {
                ...recalculatedDetails,
                ...freshStatus, // Override with fresh status/date if available
            },
            data: {
                attestationname,
                items: finalItems,
                pagination: null,
            },
        };
    }
    /**
     * SAVE
     */
    async handleSave(input) {
        return this.executeDecentralizedAction({
            ...input,
            operation: 'save'
        });
    }
    /**
     * SIGNOFF
     */
    async handleSignoff(input) {
        return this.executeDecentralizedAction({
            ...input,
            operation: 'signoff'
        });
    }
    /**
     * Helper to generate CSV content for JDBC automation
     */
    generateJDBCVersionCSV(config) {
        const headers = [
            'database_type', 'dev_database_server', 'dev_database_port', 'dev_service_account', 'dev_schema_name',
            'qa_database_server', 'qa_database_port', 'qa_service_account', 'qa_schema_name',
            'prod_database_server', 'prod_database_port', 'prod_service_account', 'prod_schema_name',
            'sql_fetch_user_accounts', 'sql_fetch_entitlements', 'sql_insert_user', 'sql_update_user',
            'sql_disable_user', 'sql_delete_user', 'sql_grant_access', 'sql_remove_access',
            'provisioning_supported', 'tables_involved', 'application_name', 'owner',
            'filepath', 'jdbc_config_id', 'decentralized_id', 'created_at', 'updated_at',
            'status', 'status_message'
        ];
        const values = headers.map(header => {
            const val = config[header];
            if (val === null || val === undefined)
                return 'null';
            // Escape commas and quotes for CSV
            const stringVal = String(val);
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
        });
        return [headers.join(','), values.join(',')].join('\n');
    }
}
exports.decentralizedActionService = new DecentralizedActionService();
//# sourceMappingURL=decentralized.action.service.js.map