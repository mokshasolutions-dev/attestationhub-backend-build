"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privilegedActionService = void 0;
const base_action_service_1 = require("./base.action.service");
class PrivilegedActionService extends base_action_service_1.BaseActionService {
    constructor() {
        super('PrivilegedActionService');
    }
    /**
     * SAVE
     * Does NOT complete workflow
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
     * Completes workflow
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
            type: 'privileged',
            owner,
            attestationname,
            list,
            isSignoff,
            comments,
            signoffstatus,
        });
    }
}
exports.privilegedActionService = new PrivilegedActionService();
//# sourceMappingURL=privileged.action.service.js.map