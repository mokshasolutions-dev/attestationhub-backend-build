"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const stageAction_controller_1 = require("../controllers/stageAction.controller");
const router = (0, express_1.Router)();
const ALLOWED_TYPES = ['application', 'entitlement', 'birthright'];
const ALLOWED_ACTIONS = ['start', 'cancel'];
router.post('/', [
    (0, express_validator_1.body)('attestationName').trim().notEmpty().withMessage('attestationName is required'),
    (0, express_validator_1.body)('type').isIn(ALLOWED_TYPES).withMessage(`type must be one of: ${ALLOWED_TYPES.join(', ')}`),
    (0, express_validator_1.body)().custom((body) => {
        const val = body.action || body.status;
        if (!val || !ALLOWED_ACTIONS.includes(val)) {
            throw new Error(`Either 'action' or 'status' is required and must be one of: ${ALLOWED_ACTIONS.join(', ')}`);
        }
        return true;
    }),
], stageAction_controller_1.performStageActionController);
exports.default = router;
//# sourceMappingURL=stageAction.routes.js.map