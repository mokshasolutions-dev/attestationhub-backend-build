"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStagingController = void 0;
const express_validator_1 = require("express-validator");
const error_middleware_1 = require("../middleware/error.middleware");
const staging_service_1 = require("../services/staging/staging.service");
exports.getStagingController = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new error_middleware_1.ValidationError('Invalid request', {
            errors: errors.array(),
        });
    }
    const { attestationType } = req.body;
    const { page = 1, pageSize = 10 } = req.query;
    const result = await staging_service_1.stagingService.getStagingData({
        attestationType,
        page: Number(page),
        pageSize: Number(pageSize)
    });
    res.setHeader('X-Cache', result.cache.status);
    if (result.cache.isDummy) {
        res.setHeader('X-Is-Dummy', 'true');
    }
    res.json(result.data);
});
//# sourceMappingURL=staging.controller.js.map