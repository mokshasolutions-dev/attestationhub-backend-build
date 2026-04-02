"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const config_1 = require("../config");
const logger_utils_1 = __importDefault(require("../utils/logger.utils"));
const router = (0, express_1.Router)();
/**
 * TEMP AUTH BOOTSTRAP (NO OKTA)
 * Used only for dev / internal testing
 */
router.get('/login', (req, res) => {
    logger_utils_1.default.info('TEMP LOGIN HIT');
    logger_utils_1.default.info('COOKIE DEBUG', {
        secure: req.secure,
        protocol: req.protocol,
        forwardedProto: req.headers['x-forwarded-proto'],
        host: req.headers.host,
    });
    /**
     * TEMP USER SOURCE
     * Later this will come from SSO / Okta
     */
    const userId = req.query.user || 'test-user';
    const token = (0, auth_middleware_1.generateToken)(userId, config_1.Config.TENANT_ID, [] // NO ROLES (as you requested)
    );
    const isHttps = req.secure ||
        req.headers['x-forwarded-proto'] === 'https';
    let cookieDomain = undefined;
    if (config_1.Config.AUTH_COOKIE_DOMAIN &&
        config_1.Config.AUTH_COOKIE_DOMAIN !== 'localhost') {
        cookieDomain = config_1.Config.AUTH_COOKIE_DOMAIN.replace(/^\./, '');
    }
    logger_utils_1.default.info('Auth cookie config', {
        userId,
        secure: isHttps,
        domain: cookieDomain ?? 'host-only',
    });
    res.cookie('USRAUTH', token, {
        httpOnly: true,
        secure: isHttps,
        sameSite: isHttps ? 'none' : 'lax',
        domain: cookieDomain,
        path: '/',
        maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({
        success: true,
        userId,
    });
});
exports.default = router;
//# sourceMappingURL=sso.routes.js.map