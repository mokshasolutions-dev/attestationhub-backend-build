"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminConfigController = getAdminConfigController;
exports.updateAdminConfigController = updateAdminConfigController;
exports.getLogoController = getLogoController;
exports.getFaviconController = getFaviconController;
const adminConsole_service_1 = require("../services/adminConsole/adminConsole.service");
const config_1 = __importDefault(require("../config"));
const ALLOWED_ADMIN_ID = '1a2c3c';
const DEFAULT_COMPANY_ID = 'default';
/**
 * GET /admin/config
 * owner must be sent as query param for GET
 */
function getAdminConfigController(req, res) {
    try {
        const config = (0, adminConsole_service_1.getAdminConfig)(DEFAULT_COMPANY_ID);
        res.json({
            logoUrl: config.logo
                ? `${config_1.default.IMAGE_BASE_URL}/api/v2/admin/logo`
                : null,
            faviconUrl: config.favicon
                ? `${config_1.default.IMAGE_BASE_URL}/api/v2/admin/favicon`
                : null,
            brandColor: config.brand_color,
            updatedBy: config.updated_by,
            updatedAt: config.updated_at
        });
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}
/**
 * POST /admin/config
 * owner must be sent in form-data
 */
function updateAdminConfigController(req, res) {
    try {
        const owner = req.body.owner;
        if (owner !== ALLOWED_ADMIN_ID) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        let logoFile;
        let faviconFile;
        if (req.files && !Array.isArray(req.files)) {
            logoFile = req.files['logoFile']?.[0];
            faviconFile = req.files['faviconFile']?.[0];
        }
        const brandColor = req.body.brandColor;
        const removeLogo = req.body.removeLogo === 'true';
        const removeFavicon = req.body.removeFavicon === 'true';
        const updated = (0, adminConsole_service_1.updateAdminConfig)(DEFAULT_COMPANY_ID, {
            logoFile,
            faviconFile,
            brandColor,
            removeLogo,
            removeFavicon,
            updatedBy: owner
        });
        res.json({
            logoUrl: updated.logo
                ? `${config_1.default.IMAGE_BASE_URL}/v2/admin/logo`
                : null,
            faviconUrl: updated.favicon
                ? `${config_1.default.IMAGE_BASE_URL}/v2/admin/favicon`
                : null,
            brandColor: updated.brand_color,
            updatedBy: updated.updated_by,
            updatedAt: updated.updated_at
        });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : 'Bad request'
        });
    }
}
/**
 * GET /admin/logo
 */
function getLogoController(req, res) {
    const config = (0, adminConsole_service_1.getAdminConfig)(DEFAULT_COMPANY_ID);
    if (!config.logo || !config.logo_mime) {
        res.status(404).end();
        return;
    }
    res.setHeader('Content-Type', config.logo_mime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(config.logo);
}
/**
 * GET /admin/favicon
 */
function getFaviconController(req, res) {
    const config = (0, adminConsole_service_1.getAdminConfig)(DEFAULT_COMPANY_ID);
    if (!config.favicon || !config.favicon_mime) {
        res.status(404).end();
        return;
    }
    res.setHeader('Content-Type', config.favicon_mime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(config.favicon);
}
//# sourceMappingURL=adminConsole.controller.js.map