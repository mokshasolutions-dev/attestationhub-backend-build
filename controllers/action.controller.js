"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionController = exports.ActionController = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const application_action_service_1 = require("../services/action/application.action.service");
const entitlement_action_service_1 = require("../services/action/entitlement.action.service");
const birthright_action_service_1 = require("../services/action/birthright.action.service");
const privileged_action_service_1 = require("../services/action/privileged.action.service");
const decentralized_action_service_1 = require("../services/action/decentralized.action.service");
class ActionController {
    serviceMap = {
        application: application_action_service_1.applicationActionService,
        entitlement: entitlement_action_service_1.entitlementActionService,
        birthright: birthright_action_service_1.birthrightActionService,
        privileged: privileged_action_service_1.privilegedActionService,
        decentralized: decentralized_action_service_1.decentralizedActionService,
    };
    resolveType(req) {
        const type = req.originalUrl.split('/')[3];
        if (!this.serviceMap[type]) {
            throw new error_middleware_1.AppError(`Invalid attestation type: ${type}`, 400, 'INVALID_TYPE');
        }
        return type;
    }
    /**
     * SAVE
     * POST /api/v2/:type/save
     */
    handleSave = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const type = this.resolveType(req);
        const { owner, attestationname, list, comments, signoffstatus } = req.body;
        // ---- Validation ----
        if (!owner || typeof owner !== 'string') {
            throw new error_middleware_1.AppError('Owner is required', 400, 'VALIDATION_ERROR');
        }
        if (!attestationname || typeof attestationname !== 'string') {
            throw new error_middleware_1.AppError('Attestation name is required', 400, 'VALIDATION_ERROR');
        }
        if (!Array.isArray(list)) {
            throw new error_middleware_1.AppError('List array is required for save', 400, 'VALIDATION_ERROR');
        }
        // ---- Delegate ----
        const service = this.serviceMap[type];
        const result = await service.handleSave({
            owner,
            attestationname,
            list, // FULL items (unchanged)
            comments, // optional
            signoffstatus, // optional
        });
        res.status(200).json(result);
    });
    /**
     * SIGNOFF
     * POST /api/v2/:type/signoff
     */
    handleSignoff = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const type = this.resolveType(req);
        const { owner, attestationname, list, comments, signoffstatus } = req.body;
        // ---- Validation ----
        if (!owner || typeof owner !== 'string') {
            throw new error_middleware_1.AppError('Owner is required', 400, 'VALIDATION_ERROR');
        }
        if (!attestationname || typeof attestationname !== 'string') {
            throw new error_middleware_1.AppError('Attestation name is required', 400, 'VALIDATION_ERROR');
        }
        // List is optional for signoff if the frontend wants the backend to use cached items
        if (list !== undefined && !Array.isArray(list)) {
            throw new error_middleware_1.AppError('List must be an array if provided', 400, 'VALIDATION_ERROR');
        }
        // ---- Delegate ----
        const service = this.serviceMap[type];
        const result = await service.handleSignoff({
            owner,
            attestationname,
            list, // FULL items (same as SAVE)
            comments, // optional
            signoffstatus, // optional
        });
        res.status(200).json(result);
    });
}
exports.ActionController = ActionController;
exports.actionController = new ActionController();
//# sourceMappingURL=action.controller.js.map