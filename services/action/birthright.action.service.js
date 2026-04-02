"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.birthrightActionService = void 0;
const base_action_service_1 = require("./base.action.service");
class BirthrightActionService extends base_action_service_1.BaseActionService {
    constructor() {
        super('BirthrightActionService');
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
            type: 'birthright',
            owner,
            attestationname,
            list,
            isSignoff,
            comments,
            signoffstatus,
        });
    }
}
exports.birthrightActionService = new BirthrightActionService();
//# sourceMappingURL=birthright.action.service.js.map