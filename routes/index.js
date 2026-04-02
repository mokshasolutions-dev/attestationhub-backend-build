"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_routes_1 = __importDefault(require("./health.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const list_routes_1 = __importDefault(require("./list.routes"));
const details_routes_1 = __importDefault(require("./details.routes"));
const sso_routes_1 = __importDefault(require("./sso.routes"));
const action_routes_1 = __importDefault(require("./action.routes"));
const config_routes_1 = __importDefault(require("./config.routes"));
const adminConsole_routes_1 = __importDefault(require("./adminConsole.routes"));
const staging_routes_1 = __importDefault(require("./staging.routes"));
const stageAction_routes_1 = __importDefault(require("./stageAction.routes"));
const fileUpload_routes_1 = __importDefault(require("./fileUpload.routes"));
const router = (0, express_1.Router)();
// Health check routes
router.use('/health', health_routes_1.default);
// Dashboard routes
router.use('/v2/dashboard', dashboard_routes_1.default);
// Lists routes
router.use('/v2/list', list_routes_1.default);
// Active Attestation Detail routes
router.use('/v2/details', details_routes_1.default);
// SSO routes
router.use('/v2/auth', sso_routes_1.default);
// Config routes
router.use('/v2/config', config_routes_1.default);
// Stage routes
router.use('/v2/staging', staging_routes_1.default);
router.use('/v2/stageaction', stageAction_routes_1.default);
// Action (Save / Signoff) routes
router.use('/v2', action_routes_1.default);
// File Upload route
router.use('/v2', fileUpload_routes_1.default);
// Admin console routes
router.use('/v2/admin', adminConsole_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map