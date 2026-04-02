"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const services_1 = require("../services");
const dashboard_service_1 = require("../services/dashboard/dashboard.service");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
/**
 * Validate request and throw error if invalid
 */
function validateRequest(req) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new error_middleware_1.ValidationError('Invalid request parameters', {
            errors: errors.array(),
        });
    }
}
/**
 * POST /v2/dashboard/
 * Launch and fetch attestation statistics for a specific owner
 */
router.post('/', [
    (0, express_validator_1.body)('owner').isString().notEmpty().withMessage('Owner ID is required'),
], (0, error_middleware_1.asyncHandler)(async (req, res) => {
    // confirm redis request hit or not 
    console.error('DASHBOARD ROUTE HANDLER HIT', {
        method: req.method,
        url: req.originalUrl,
    });
    validateRequest(req);
    const { owner } = req.body;
    // 1. Launch/Fetch statistics from SailPoint (via Cached Service)
    const result = await (0, dashboard_service_1.getDashboardData)(owner);
    // 2. Transform to desired format
    const transformedData = services_1.IAMTransformer.transformDashboardData(result.data);
    // 3. Set Cache observability header
    res.setHeader('X-Cache', result.cache.status);
    res.setHeader('X-Is-Dummy', String(result.cache.isDummy));
    // 4. Return only transformed data as requested (no meta/devenv)
    res.json(transformedData);
}));
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map