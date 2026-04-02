"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const error_middleware_1 = require("../middleware/error.middleware");
const list_service_1 = require("../services/lists/list.service");
const router = (0, express_1.Router)();
const ATTESTATION_TYPES = [
    'application',
    'birthright',
    'entitlement',
    'decentralized',
    'privileged',
];
// const STATUS_TYPES = ['Completed', 'Pending', 'Sign off'] as const;
/**
 * POST /api/v2/lists
 * owner + attestationType are sent in the body
 * pagination / filters sent via query params
 */
router.post('/', [
    // -------- BODY (required) --------
    (0, express_validator_1.body)('owner')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('owner is required'),
    (0, express_validator_1.body)('attestationType')
        .isIn(ATTESTATION_TYPES)
        .withMessage(`attestationType must be one of: ${ATTESTATION_TYPES.join(', ')}`),
    // -------- QUERY (optional) --------
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page must be a positive integer'),
    (0, express_validator_1.query)('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('pageSize must be a positive integer and cannot exceed 100'),
    (0, express_validator_1.query)('search')
        .optional()
        .isString()
        .trim()
], (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new error_middleware_1.ValidationError('Invalid request', {
            errors: errors.array(),
        });
    }
    const { owner, attestationType } = req.body;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const signoffstatus = req.query.signoffstatus;
    const search = req.query.search;
    const result = await list_service_1.listsService.getAttestationList({
        owner,
        type: attestationType,
        page,
        pageSize,
        signoffstatus,
        search,
    });
    res.setHeader('X-Cache', result.cache.status);
    res.setHeader('X-Is-Dummy', String(result.cache.isDummy));
    res.json(result.data);
}));
exports.default = router;
//# sourceMappingURL=list.routes.js.map