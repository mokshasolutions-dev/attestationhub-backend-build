"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iamService = void 0;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../config");
const base_service_1 = require("../base.service");
const error_middleware_1 = require("../../middleware/error.middleware");
const crypto_utils_1 = require("../../utils/crypto.utils");
const workflowResolver_1 = require("../../config/workflowResolver");
const sailpoint_dummy_json_1 = __importDefault(require("../../data/sailpoint.dummy.json"));
const sailpoint_lists_dummy_json_1 = __importDefault(require("../../data/sailpoint-lists.dummy.json"));
const sailpoint_detail_dummy_json_1 = __importDefault(require("../../data/sailpoint-detail.dummy.json"));
/**
 * IAM Service - Handles communication with SailPoint Workflow API
 */
class IAMService extends base_service_1.BaseService {
    client;
    constructor() {
        super('IAMService');
        this.client = this.createClient();
        if (!config_1.Config.IAM_BASE_URL.includes('ngrok')) {
            this.validateAllWorkflows();
        }
    }
    // ------------------------------------------------------------------
    // INTERNAL HELPERS
    // ------------------------------------------------------------------
    getCredential(encrypted) {
        try {
            const [iv, tag, data] = encrypted.split(':');
            if (!iv || !tag || !data) {
                throw new Error('Invalid encrypted format');
            }
            return (0, crypto_utils_1.decrypt)(data, config_1.Config.JWT_SECRET, iv, tag);
        }
        catch (error) {
            this.logger.error('Failed to decrypt credential', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw new error_middleware_1.AppError('Internal configuration error', 500, 'CONFIG_ERROR');
        }
    }
    createClient() {
        const username = this.getCredential(config_1.Config.IAM_USERNAME_ENCRYPTED);
        const password = this.getCredential(config_1.Config.IAM_PASSWORD_ENCRYPTED);
        const authHeader = Buffer.from(`${username}:${password}`).toString('base64');
        const client = axios_1.default.create({
            baseURL: config_1.Config.IAM_BASE_URL,
            timeout: config_1.Config.IAM_REQUEST_TIMEOUT_MS,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${authHeader}`,
            },
        });
        client.interceptors.request.use((requestConfig) => {
            this.logger.debug('Outgoing SailPoint request', {
                method: requestConfig.method,
                url: requestConfig.url,
            });
            return requestConfig;
        });
        client.interceptors.response.use((response) => {
            this.logger.debug('SailPoint response received', {
                status: response.status,
                url: response.config.url,
            });
            return response;
        }, (error) => {
            this.logger.warn('SailPoint API error', {
                status: error.response?.status,
                url: error.config?.url,
                message: error.message,
                data: error.response?.data,
            });
            throw this.transformError(error);
        });
        return client;
    }
    // ------------------------------------------------------------------
    // DASHBOARD WORKFLOW (WITH FALLBACK)
    // ------------------------------------------------------------------
    async launchAttestationStatistics(owner) {
        zod_1.z.string().trim().min(1, 'Owner is required').parse(owner);
        if (config_1.Config.IAM_USE_DUMMY_DATA) {
            return {
                data: sailpoint_dummy_json_1.default,
                isDummy: true,
            };
        }
        const payload = {
            workflowArgs: {
                owner,
                attestationType: '',
            },
        };
        try {
            const data = await this.withTiming('Launch Attestation Stats', async () => {
                const response = await this.client.post(config_1.Config.DASHBOARD_WORKFLOW_API, payload);
                return response.data;
            });
            return { data, isDummy: false };
        }
        catch (error) {
            this.logger.warn('SailPoint unreachable, falling back to dummy dashboard data', { owner });
            return {
                data: sailpoint_dummy_json_1.default,
                isDummy: true,
            };
        }
    }
    // ------------------------------------------------------------------
    // LIST WORKFLOW (WITH FALLBACK)
    // ------------------------------------------------------------------
    async getAttestationList(owner, type) {
        zod_1.z.object({
            owner: zod_1.z.string().trim().min(1, 'Owner is required'),
            type: zod_1.z.string().trim().min(1, 'Type is required'),
        }).parse({ owner, type });
        if (config_1.Config.IAM_USE_DUMMY_DATA) {
            return { data: this.getListDummy(type), isDummy: true };
        }
        try {
            const data = await this.withTiming('Launch Attestation List', async () => {
                const response = await this.client.post(config_1.Config.LIST_WORKFLOW_API, {
                    workflowArgs: {
                        owner,
                        attestationType: type,
                    },
                });
                return response.data;
            });
            return { data, isDummy: false };
        }
        catch (error) {
            this.logger.warn('SailPoint unreachable, falling back to dummy list data', { owner, type });
            return { data: this.getListDummy(type), isDummy: true };
        }
    }
    getListDummy(type) {
        const dummy = sailpoint_lists_dummy_json_1.default[type];
        if (!dummy) {
            this.logger.warn(`Dummy list data not found for type: ${type}. Returning empty structure.`, { type });
            return {
                status: null,
                requestID: 'dummy-list-request',
                warnings: null,
                errors: null,
                retryWait: 0,
                metaData: null,
                attributes: {
                    responseMap: {},
                },
                retry: false,
                failure: false,
                complete: true,
                success: true,
            };
        }
        return dummy;
    }
    // ------------------------------------------------------------------
    // ATTESTATION DETAILS WORKFLOW (WITH FALLBACK)
    // ------------------------------------------------------------------
    async getAttestationDetails(owner, attestationType, attestationName) {
        zod_1.z.object({
            owner: zod_1.z.string().trim().min(1, 'Owner is required'),
            attestationType: zod_1.z.string().trim().min(1, 'Type is required'),
            attestationName: zod_1.z.string().trim().min(1, 'Attestation Name is required'),
        }).parse({ owner, attestationType, attestationName });
        if (config_1.Config.IAM_USE_DUMMY_DATA) {
            return { data: this.getDetailsDummy(attestationType), isDummy: true };
        }
        try {
            const data = await this.withTiming('Launch Attestation Details', async () => {
                const response = await this.client.post(config_1.Config.DETAILS_WORKFLOW_API, {
                    workflowArgs: {
                        owner,
                        attestationType,
                        attestationName,
                    },
                });
                return response.data;
            });
            return { data, isDummy: false };
        }
        catch (error) {
            this.logger.warn('SailPoint unreachable, falling back to dummy attestation details', { owner, attestationType, attestationName });
            return {
                data: this.getDetailsDummy(attestationType),
                isDummy: true,
            };
        }
    }
    getDetailsDummy(attestationType) {
        const dummy = sailpoint_detail_dummy_json_1.default[attestationType];
        if (!dummy) {
            this.logger.warn(`Dummy attestation details not found for type: ${attestationType}. Returning empty structure.`, { attestationType });
            return {
                workflowArgs: {},
                attributes: {
                    responseMap: {},
                },
                success: true,
            };
        }
        return dummy;
    }
    // ------------------------------------------------------------------
    // STAGE WORKFLOW
    // ------------------------------------------------------------------
    async launchStageWorkflow(attestationType) {
        zod_1.z.string().trim().min(1, 'Attestation type is required').parse(attestationType);
        if (config_1.Config.IAM_USE_DUMMY_DATA) {
            return {
                data: this.getDetailsDummy(attestationType),
                isDummy: true
            };
        }
        try {
            const data = await this.withTiming('Launch Stage Workflow', async () => {
                const response = await this.client.post(config_1.Config.STAGE_WORKFLOW_API, {
                    workflowArgs: {
                        attestationType,
                    },
                });
                return response.data;
            });
            return { data, isDummy: false };
        }
        catch (error) {
            this.logger.warn('SailPoint unreachable, falling back to dummy data for stage', { attestationType });
            return {
                data: this.getDetailsDummy(attestationType),
                isDummy: true,
            };
        }
    }
    // ------------------------------------------------------------------
    // STAGE ACTION WORKFLOW
    // ------------------------------------------------------------------
    async launchStageActionWorkflow(attestationName, status, type) {
        zod_1.z.string().trim().min(1, 'Attestation name is required').parse(attestationName);
        zod_1.z.enum(['start', 'cancel']).parse(status);
        zod_1.z.string().trim().min(1, 'Type is required').parse(type);
        if (config_1.Config.IAM_USE_DUMMY_DATA) {
            return { data: { success: true, dummy: true }, isDummy: true };
        }
        let endpoint;
        switch (type.toLowerCase()) {
            case 'application':
                endpoint = config_1.Config.STAGE_ACTION_APPLICATION_API;
                break;
            case 'entitlement':
                endpoint = config_1.Config.STAGE_ACTION_ENTITLEMENT_API;
                break;
            case 'birthright':
                endpoint = config_1.Config.STAGE_ACTION_BIRTHRIGHT_API;
                break;
            default:
                throw new error_middleware_1.AppError(`Invalid stage action type: ${type}`, 400, 'INVALID_TYPE');
        }
        const payload = {
            workflowArgs: {
                attestationName,
                status,
                type: type.toLowerCase()
            }
        };
        this.logger.info('SailPoint Stage Action Request Payload', {
            endpoint,
            payload
        });
        console.log("./", JSON.stringify(payload, null, 2));
        try {
            const data = await this.withTiming(`Launch Stage Action Workflow (${type})`, async () => {
                const response = await this.client.post(endpoint, payload);
                console.log("SailPoint Response Body:", JSON.stringify(response.data, null, 2));
                this.logger.info('SailPoint Stage Action Response Received', {
                    type,
                    status,
                    responseData: response.data
                });
                return response.data;
            });
            return { data, isDummy: false };
        }
        catch (error) {
            this.logger.error('Stage action workflow failure', { type, status, endpoint, error });
            throw error;
        }
    }
    // ------------------------------------------------------------------
    // ERROR TRANSFORMATION
    // ------------------------------------------------------------------
    transformError(error) {
        // Network / timeout / no response
        if (!error.response) {
            return new error_middleware_1.AppError('Unable to reach SailPoint service', 502, 'SAILPOINT_UNAVAILABLE', true, {
                message: error.message,
                code: error.code,
            });
        }
        const status = error.response.status;
        const data = error.response.data;
        const upstreamMessage = data?.['message'] ||
            data?.['error'] ||
            'SailPoint service error';
        switch (status) {
            case 400:
                return new error_middleware_1.AppError(upstreamMessage || 'Invalid request sent to SailPoint', 400, 'SAILPOINT_BAD_REQUEST', false, data);
            case 401:
            case 403:
                return new error_middleware_1.AppError('Authentication with SailPoint failed', 502, 'SAILPOINT_AUTH_ERROR', true, {
                    originalStatus: status,
                    data,
                });
            case 404:
                return new error_middleware_1.AppError('SailPoint workflow not found', 502, 'SAILPOINT_NOT_FOUND', true, data);
            case 408:
                return new error_middleware_1.AppError('SailPoint request timed out', 504, 'SAILPOINT_TIMEOUT', true, data);
            case 429:
                return new error_middleware_1.AppError('SailPoint rate limit exceeded', 503, 'SAILPOINT_RATE_LIMIT', true, data);
            default:
                if (status >= 500) {
                    return new error_middleware_1.AppError('SailPoint internal server error', 502, 'SAILPOINT_SERVER_ERROR', true, {
                        originalStatus: status,
                        data,
                    });
                }
        }
        // Absolute fallback – required for TypeScript exhaustiveness
        return new error_middleware_1.AppError(upstreamMessage, 502, 'SAILPOINT_UNKNOWN_ERROR', true, {
            originalStatus: status,
            data,
        });
    }
    // ------------------------------------------------------------------
    // ACTION WORKFLOWS (SAVE / SIGNOFF)
    // ------------------------------------------------------------------
    async launchActionWorkflow(type, operation, workflowArgs) {
        const url = (0, workflowResolver_1.resolveActionWorkflowUrl)(type);
        console.log("url", url);
        this.logger.info('Launching SailPoint Action Workflow', {
            type,
            operation,
            url,
        });
        const response = await this.client.post(url, { workflowArgs });
        return response.data;
    }
    // ------------------------------------------------------------------
    // SIGNOFF
    // ------------------------------------------------------------------
    async signoffAttestation(type, owner, attestationname, payload) {
        //  ONLY decentralized uses V2 /signoff
        if (type === 'decentralized') {
            const url = `/v2/attestations/${type}/${encodeURIComponent(attestationname)}/signoff`;
            this.logger.info('Calling SailPoint V2 SIGNOFF (decentralized)', {
                type,
                attestationname,
                itemCount: payload.items.length,
            });
            const response = await this.client.post(url, payload, {
                headers: {
                    'X-Owner': owner,
                },
            });
            return response.data;
        }
        // ALL other types use action workflow SIGNOFF
        this.logger.info('Launching SailPoint SIGNOFF workflow', {
            type,
            attestationname,
            itemCount: payload.items.length,
        });
        return this.launchActionWorkflow(type, 'signoff', {
            owner,
            attestationname,
            items: payload.items,
        });
    }
    /**
     * validateAllWorkflows
     * Non-blocking startup check for all configured Action workflow URLs.
     * Runs sequentially to avoid API storm.
     */
    async validateAllWorkflows() {
        this.logger.info('Starting non-blocking SailPoint Action workflow URL validation...');
        // Run in background — must never block app startup
        setImmediate(async () => {
            const types = [
                'application',
                'entitlement',
                'privileged',
                'decentralized',
                'birthright',
            ];
            for (const type of types) {
                let url;
                try {
                    url = (0, workflowResolver_1.resolveActionWorkflowUrl)(type);
                }
                catch (error) {
                    this.logger.warn(`ACTION WORKFLOW URL MISSING for ${type}`, {
                        error: error.message,
                    });
                    continue;
                }
                try {
                    // POST-based validation (HEAD is unreliable in SailPoint)
                    await this.client.post(url, {
                        workflowArgs: {
                            owner: '__validation__',
                        },
                    }, { timeout: 20000 });
                    this.logger.debug(`Action workflow URL validated via POST: ${url}`, {
                        type,
                    });
                }
                catch (error) {
                    const status = error.response?.status;
                    if (status === 404) {
                        // Only real signal that workflow does not exist
                        this.logger.warn(`ACTION WORKFLOW URL NOT FOUND (404): ${url}`, {
                            type,
                        });
                    }
                    else if (status === 400 || status === 401 || status === 403) {
                        // Expected: workflow exists but payload/auth not valid for validation
                        this.logger.debug(`Action workflow URL exists but validation POST was rejected`, {
                            type,
                            url,
                            status,
                        });
                    }
                    else {
                        // Network / timeout / 5xx / ngrok weirdness
                        this.logger.warn(`Could not verify action workflow URL via POST`, {
                            type,
                            url,
                            status,
                            error: error.message,
                        });
                    }
                }
            }
            this.logger.info('SailPoint Action workflow URL validation sequence complete.');
        });
    }
    // ------------------------------------------------------------------
    // HEALTH CHECK
    // ------------------------------------------------------------------
    async healthCheck() {
        const start = Date.now();
        try {
            await axios_1.default.get(config_1.Config.IAM_BASE_URL || '', {
                timeout: 5000,
            });
            return {
                healthy: true,
                latencyMs: Date.now() - start,
            };
        }
        catch (error) {
            return {
                healthy: false,
                latencyMs: Date.now() - start,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.iamService = new IAMService();
exports.default = exports.iamService;
//# sourceMappingURL=iam.service.js.map