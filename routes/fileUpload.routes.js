"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = require("../middleware/upload.middleware");
const fileUpload_controller_1 = require("../controllers/fileUpload.controller");
const router = (0, express_1.Router)();
/**
 * POST /api/v2/fileupload
 * Multipart form-data: file (PDF/JPG, max 2MB), type (MFA|IGA|SSO|PAM), attestationname
 */
router.post('/decentralized/fileupload', (req, res, next) => {
    upload_middleware_1.evidenceUpload.single('file')(req, res, (err) => {
        if (err) {
            // Handle multer-specific errors (file too large, invalid type, etc.)
            const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'File too large. Maximum allowed size is 2 MB.'
                : err.message || 'File upload failed';
            return res.status(status).json({
                success: false,
                error: { code: err.code || 'UPLOAD_ERROR', message },
            });
        }
        return next();
    });
}, fileUpload_controller_1.fileUploadController.handleFileUpload);
/**
 * DELETE /api/v2/decentralized/fileupload
 * JSON body: { type: "MFA"|"IGA"|"SSO"|"PAM", attestationname: string }
 */
router.delete('/decentralized/fileupload', fileUpload_controller_1.fileUploadController.handleFileDelete);
exports.default = router;
//# sourceMappingURL=fileUpload.routes.js.map