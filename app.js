"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const iam_service_1 = __importDefault(require("./services/iam/iam.service"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const security_middleware_1 = require("./middleware/security.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const adminConsole_routes_1 = __importDefault(require("./routes/adminConsole.routes"));
/**
 * Create and configure Express application
 */
function createApp() {
    const app = (0, express_1.default)();
    // Trust proxy for accurate IP detection behind load balancers
    app.set('trust proxy', 1);
    // Disable X-Powered-By header
    app.disable('x-powered-by');
    // Security middleware (order matters!)
    app.use(security_middleware_1.helmetMiddleware);
    app.use(security_middleware_1.corsMiddleware);
    app.use(security_middleware_1.securityHeaders);
    app.use(security_middleware_1.rateLimitMiddleware);
    // Request processing
    app.use(error_middleware_1.requestIdMiddleware);
    app.use(error_middleware_1.requestLoggerMiddleware);
    // Body parsing with size limits
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
    //Cookie Parsing
    app.use((0, cookie_parser_1.default)());
    // Input sanitization
    app.use(security_middleware_1.sanitizeRequest);
    // Serve static files from 'public' directory (e.g. JDBC CSVs)
    app.use('/public', express_1.default.static(path_1.default.join(process.cwd(), 'public')));
    app.use((req, res, next) => {
        console.log(`📨 ${req.method} ${req.path}`);
        next();
    });
    // API routes
    console.log('🔧 Mounting /api routes...', typeof routes_1.default);
    // API routes
    app.use('/api', routes_1.default);
    // db 
    app.use(adminConsole_routes_1.default);
    // Trigger non-blocking SailPoint workflow validation
    iam_service_1.default.validateAllWorkflows();
    // 404 handler for unmatched routes
    app.use(error_middleware_1.notFoundHandler);
    // Global error handler (must be last)
    app.use(error_middleware_1.errorHandler);
    return app;
}
exports.default = createApp;
//# sourceMappingURL=app.js.map