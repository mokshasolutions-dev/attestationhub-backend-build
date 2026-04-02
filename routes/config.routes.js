"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_middleware_1 = require("../middleware/error.middleware");
const config_controller_1 = require("../controllers/config.controller");
const router = (0, express_1.Router)();
/**
 * Config API
 * GET /api/v2/config/attestations
 */
router.get('/attestations', (0, error_middleware_1.asyncHandler)(config_controller_1.getAvailableAttestations));
exports.default = router;
//# sourceMappingURL=config.routes.js.map