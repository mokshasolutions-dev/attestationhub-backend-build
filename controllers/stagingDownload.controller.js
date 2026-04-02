"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadStagingCsvController = void 0;
const express_validator_1 = require("express-validator");
const error_middleware_1 = require("../middleware/error.middleware");
const staging_service_1 = require("../services/staging/staging.service");
/**
 * Controller for Staging CSV Download API
 * POST /api/v2/staging/download
 */
exports.downloadStagingCsvController = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new error_middleware_1.ValidationError('Invalid request parameters', {
            errors: errors.array(),
        });
    }
    const { attestationName, attestationType } = req.query;
    try {
        const csvContent = await staging_service_1.stagingService.generateStagingCsv(attestationName, attestationType);
        // Sanitize filename
        const fileName = `${attestationName.replace(/[/\\?%*:|"<>]/g, '_')}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(csvContent);
    }
    catch (error) {
        if (error.message.includes('No cached data') || error.message.includes('not found')) {
            throw new error_middleware_1.ValidationError(error.message);
        }
        throw error;
    }
});
//# sourceMappingURL=stagingDownload.controller.js.map