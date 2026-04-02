"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationActionService = void 0;
const base_action_service_1 = require("./base.action.service");
class ApplicationActionService extends base_action_service_1.BaseActionService {
    constructor() {
        super('ApplicationActionService');
    }
    /**
     * SAVE
     * Persists decisions only
     */
    async handleSave(input) {
        return this.processAction({
            type: 'application',
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
     * Completes attestation
     */
    async handleSignoff(input) {
        return this.processAction({
            type: 'application',
            owner: input.owner,
            attestationname: input.attestationname,
            list: input.list,
            isSignoff: true,
            comments: input.comments,
            signoffstatus: input.signoffstatus,
        });
    }
}
exports.applicationActionService = new ApplicationActionService();
//# sourceMappingURL=application.action.service.js.map