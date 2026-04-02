"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = __importStar(require("./config"));
const redis_service_1 = __importDefault(require("./services/redis/redis.service"));
const logger_utils_1 = __importDefault(require("./utils/logger.utils"));
async function gracefulShutdown(signal) {
    logger_utils_1.default.info(`Received ${signal}, shutting down`);
    try {
        await redis_service_1.default.disconnect();
    }
    catch {
        // ignored
    }
    process.exit(0);
}
async function startServer() {
    try {
        (0, config_1.validateSecurityConfig)();
        logger_utils_1.default.info('Security configuration validated');
        const app = (0, app_1.createApp)();
        const port = config_1.default.PORT;
        const server = app.listen(port, async () => {
            logger_utils_1.default.info(`Server running on port ${port}`, {
                environment: config_1.default.NODE_ENV,
                tenantId: config_1.default.TENANT_ID,
            });
            if (config_1.default.REDIS_ENABLED) {
                try {
                    await redis_service_1.default.waitForReady(3000);
                    logger_utils_1.default.info('Redis health check', await redis_service_1.default.ping());
                }
                catch {
                    logger_utils_1.default.warn('Redis health check failed (ignored)');
                }
            }
            else {
                logger_utils_1.default.info('Redis disabled');
            }
        });
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;
        process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (err) => {
            logger_utils_1.default.error('Uncaught exception', {
                error: err.message,
                stack: err.stack,
            });
            void gracefulShutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason) => {
            logger_utils_1.default.error('Unhandled rejection', { reason });
        });
    }
    catch (err) {
        logger_utils_1.default.error('Server startup failed', {
            error: err instanceof Error ? err.message : err,
        });
        process.exit(1);
    }
}
void startServer();
//# sourceMappingURL=server.js.map