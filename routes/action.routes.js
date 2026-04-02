"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const action_controller_1 = require("../controllers/action.controller");
const router = (0, express_1.Router)();
/**
 * Action Routes (LOCKED)
 * Supported: application, entitlement, birthright, privileged, decentralized
 *
 * SAVE and SIGNOFF are EXPLICIT and SEPARATE
 */
// ---------------- SAVE ----------------
// POST /api/v2/application/save
router.post('/application/save', action_controller_1.actionController.handleSave);
// POST /api/v2/entitlement/save
router.post('/entitlement/save', action_controller_1.actionController.handleSave);
// POST /api/v2/birthright/save
router.post('/birthright/save', action_controller_1.actionController.handleSave);
// POST /api/v2/privileged/save
router.post('/privileged/save', action_controller_1.actionController.handleSave);
// POST /api/v2/decentralized/save
router.post('/decentralized/save', action_controller_1.actionController.handleSave);
// ---------------- SIGNOFF ----------------
// POST /api/v2/application/signoff
router.post('/application/signoff', action_controller_1.actionController.handleSignoff);
// POST /api/v2/entitlement/signoff
router.post('/entitlement/signoff', action_controller_1.actionController.handleSignoff);
// POST /api/v2/birthright/signoff
router.post('/birthright/signoff', action_controller_1.actionController.handleSignoff);
// POST /api/v2/privileged/signoff
router.post('/privileged/signoff', action_controller_1.actionController.handleSignoff);
// POST /api/v2/decentralized/signoff
router.post('/decentralized/signoff', action_controller_1.actionController.handleSignoff);
exports.default = router;
//# sourceMappingURL=action.routes.js.map