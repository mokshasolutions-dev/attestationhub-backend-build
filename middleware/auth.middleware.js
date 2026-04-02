"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.requireRoles = requireRoles;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const logger_utils_1 = __importDefault(require("../utils/logger.utils"));
/**
 * JWT Authentication middleware (COOKIE BASED)
 * Validates JWT from HTTPOnly cookie
 */
function authenticateJWT(req, res, next) {
    const token = req.cookies?.USRAUTH;
    if (!token) {
        const response = {
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        };
        res.status(401).json(response);
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.Config.JWT_SECRET);
        if (decoded.tenantId !== config_1.Config.TENANT_ID) {
            logger_utils_1.default.warn('Token tenant mismatch', {
                tokenTenant: decoded.tenantId,
                expectedTenant: config_1.Config.TENANT_ID,
                userId: decoded.sub,
            });
            const response = {
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Token not valid for this tenant',
                },
            };
            res.status(403).json(response);
            return;
        }
        const user = {
            id: decoded.sub,
            tenantId: decoded.tenantId,
            roles: decoded.roles,
        };
        req.user = user;
        next();
    }
    catch (error) {
        logger_utils_1.default.warn('JWT verification failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        const response = {
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired session',
            },
        };
        res.status(401).json(response);
    }
}
/**
 * Role-based authorization middleware
 */
function requireRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }
        const allowed = roles.some(role => req.user.roles.includes(role));
        if (!allowed) {
            logger_utils_1.default.warn('Insufficient permissions', {
                userId: req.user.id,
                requiredRoles: roles,
                userRoles: req.user.roles,
            });
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions',
                },
            });
            return;
        }
        next();
    };
}
/**
 * Generate JWT token (USED ONLY BY SSO / LOGIN)
 */
function generateToken(userId, tenantId, roles) {
    const payload = {
        sub: userId,
        tenantId,
        roles,
    };
    return jsonwebtoken_1.default.sign(payload, config_1.Config.JWT_SECRET, {
        expiresIn: '8h',
        algorithm: 'HS256',
    });
}
//# sourceMappingURL=auth.middleware.js.map