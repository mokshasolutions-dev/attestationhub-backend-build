"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evidenceUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
/**
 * File filter: only allow PDF and image files
 */
function fileFilter(_req, file, cb) {
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml',
        'image/x-icon', 'image/vnd.microsoft.icon',
    ];
    const allowedExtensions = [
        '.pdf', '.jpg', '.jpeg', '.png', '.gif',
        '.bmp', '.webp', '.tiff', '.tif', '.svg', '.ico',
    ];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only PDF and image files are allowed.'));
    }
}
/**
 * Configured multer instance for evidence file uploads
 * Uses memoryStorage so the file is saved AFTER text fields are parsed
 * (diskStorage runs before body fields are available)
 * - Max size: 2 MB
 * - Allowed types: PDF, images
 */
exports.evidenceUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
    },
});
//# sourceMappingURL=upload.middleware.js.map