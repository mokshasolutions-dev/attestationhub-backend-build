"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableAttestations = getAvailableAttestations;
const error_middleware_1 = require("../middleware/error.middleware");
const config_service_1 = require("../services/config/config.service");
async function getAvailableAttestations(req, res) {
    const owner = req.user?.id ||
        req.query.owner;
    if (!owner) {
        throw new error_middleware_1.AppError('Owner is required', 400, 'OWNER_REQUIRED');
    }
    const result = await (0, config_service_1.getAvailableAttestationTypes)(owner);
    res.setHeader('X-Cache', result.cache.status);
    res.status(200).json({
        availableAttestations: result.data,
    });
}
//# sourceMappingURL=config.controller.js.map