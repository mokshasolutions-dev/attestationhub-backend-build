"use strict";
// activeAttestation.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const details_services_1 = require("../services/details/details.services");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
/**
 * Locked enum for attestation types (LOWERCASE)
 */
const ALLOWED_ATTESTATION_TYPES = new Set([
    'application',
    'birthright',
    'entitlement',
    'privileged',
    'decentralized',
]);
/**
 * Pagination defaults & limits
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
/**
 * POST /v2/details/:attestationtype
 */
router.post('/:attestationtype', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    /**
     * 1. Path param normalization (LOWERCASE)
     */
    const attestationtype = String(req.params.attestationtype || '').toLowerCase();
    if (!ALLOWED_ATTESTATION_TYPES.has(attestationtype)) {
        throw new error_middleware_1.AppError(`invalid attestationtype: ${attestationtype}`, 400, 'INVALID_ATTESTATION_TYPE');
    }
    /**
     * 2. Body validation
     */
    const body = req.body ?? {};
    const owner = body.owner;
    const attestationname = body.attestationname;
    if (typeof owner !== 'string' || owner.trim() === '') {
        throw new error_middleware_1.AppError('owner is required and must be a non-empty string', 400, 'OWNER_REQUIRED');
    }
    if (typeof attestationname !== 'string' || attestationname.trim() === '') {
        throw new error_middleware_1.AppError('attestationname is required and must be a non-empty string', 400, 'ATTESTATION_NAME_REQUIRED');
    }
    /**
     * 3. Pagination (query > body > default)
     */
    const pageRaw = req.query.page ?? body.page;
    const pageSizeRaw = req.query.pageSize ?? body.pageSize;
    const search = req.query.search ?? body.search ?? '';
    const page = pageRaw !== undefined ? Number(pageRaw) : DEFAULT_PAGE;
    const pageSize = pageSizeRaw !== undefined ? Number(pageSizeRaw) : DEFAULT_LIMIT;
    if (!Number.isInteger(page) || page < 1) {
        throw new error_middleware_1.AppError('page must be an integer >= 1', 400, 'INVALID_PAGE');
    }
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_LIMIT) {
        throw new error_middleware_1.AppError(`pageSize must be an integer between 1 and ${MAX_LIMIT}`, 400, 'INVALID_PAGE_SIZE');
    }
    /**
     * 4. Service call (NORMALIZED INPUT)
     */
    const result = await (0, details_services_1.getActiveAttestationDetails)(owner, attestationtype, attestationname, page, pageSize, search);
    /**
     * 5. Set Cache observability header
     */
    res.setHeader('X-Cache', result.cache.status);
    res.setHeader('X-Is-Dummy', String(result.cache.isDummy));
    /**
     * 6. Response
     */
    res.status(200).json(result.data);
}));
exports.default = router;
//# sourceMappingURL=details.routes.js.map