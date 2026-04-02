"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const staging_controller_1 = require("../controllers/staging.controller");
const stagingDownload_controller_1 = require("../controllers/stagingDownload.controller");
const router = (0, express_1.Router)();
const ALLOWED_TYPES = ['application', 'birthright', 'entitlement'];
router.post('/', [
    (0, express_validator_1.body)('attestationType')
        .isIn(ALLOWED_TYPES)
        .withMessage(`attestationType must be one of: ${ALLOWED_TYPES.join(', ')}`),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
], staging_controller_1.getStagingController);
router.get('/download', [
    (0, express_validator_1.query)('attestationName').trim().notEmpty().withMessage('attestationName is required'),
    (0, express_validator_1.query)('attestationType')
        .isIn(ALLOWED_TYPES)
        .withMessage(`Attestation Type must be one of: ${ALLOWED_TYPES.join(', ')}`),
], stagingDownload_controller_1.downloadStagingCsvController);
exports.default = router;
//# sourceMappingURL=staging.routes.js.map