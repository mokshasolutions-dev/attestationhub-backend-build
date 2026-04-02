"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performStageActionController = void 0;
const express_validator_1 = require("express-validator");
const error_middleware_1 = require("../middleware/error.middleware");
const stageAction_service_1 = require("../services/stageAction/stageAction.service");
/**
 * Controller for Stage Action API
 * POST /api/v2/stageaction
 */
exports.performStageActionController = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new error_middleware_1.ValidationError('Invalid request parameters', {
            errors: errors.array(),
        });
    }
    const { attestationName, type } = req.body;
    const action = req.body.action || req.body.status;
    const result = await stageAction_service_1.stageActionService.performStageAction({
        attestationName,
        action,
        type
    });
    res.json(result);
});
//# sourceMappingURL=stageAction.controller.js.map