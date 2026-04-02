"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const adminConsole_controller_1 = require("../controllers/adminConsole.controller");
const router = (0, express_1.Router)();
// Memory storage (we store BLOB in SQLite)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 // 500KB
    }
});
router.get('/white-label', adminConsole_controller_1.getAdminConfigController);
router.post('/white-label', upload.fields([
    { name: 'logoFile', maxCount: 1 },
    { name: 'faviconFile', maxCount: 1 }
]), adminConsole_controller_1.updateAdminConfigController);
router.get('/logo', adminConsole_controller_1.getLogoController);
router.get('/favicon', adminConsole_controller_1.getFaviconController);
exports.default = router;
//# sourceMappingURL=adminConsole.routes.js.map