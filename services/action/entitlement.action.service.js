"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entitlementActionService = void 0;
const base_action_service_1 = require("./base.action.service");
class EntitlementActionService extends base_action_service_1.BaseActionService {
    constructor() {
        super('EntitlementActionService');
    }
    /**
     * SAVE
     * Entitlement SAVE is allowed but may be ignored by SailPoint (doc behavior)
     */
    async handleSave(input) {
        return this.handleInternal({
            owner: input.owner,
            attestationname: input.attestationname,
            list: input.list,
            isSignoff: false,
            comments: input.comments,
            signoffstatus: input.signoffstatus,
        });
    }
    /**
     * SIGNOFF
     * Completes entitlement attestation (DOC-CORRECT)
     */
    async handleSignoff(input) {
        return this.handleInternal({
            owner: input.owner,
            attestationname: input.attestationname,
            list: input.list,
            isSignoff: true,
            comments: input.comments,
            signoffstatus: input.signoffstatus,
        });
    }
    /**
     * Internal shared logic
     */
    async handleInternal(input) {
        const { owner, attestationname, list, isSignoff, comments, signoffstatus, } = input;
        return this.processAction({
            type: 'entitlement',
            owner,
            attestationname,
            list,
            isSignoff,
            comments,
            signoffstatus,
        });
    }
}
exports.entitlementActionService = new EntitlementActionService();
//# sourceMappingURL=entitlement.action.service.js.map