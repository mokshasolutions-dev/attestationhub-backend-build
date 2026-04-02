"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadController = exports.FileUploadController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const error_middleware_1 = require("../middleware/error.middleware");
const evidenceUpload_service_1 = require("../services/storage/evidenceUpload.service");
const config_1 = require("../config");
const VALID_TYPES = ['MFA', 'IGA', 'SSO', 'PAM'];
/**
 * Sanitize a string for use in a filename:
 * - Replace spaces with underscores
 * - Replace forward slashes with hyphens
 */
function sanitize(value) {
    return value.replace(/\s+/g, '_').replace(/\//g, '-');
}
class FileUploadController {
    /**
     * POST /api/v2/decentralized/fileupload
     * Accepts a multipart form with: file, type, attestationname
     */
    handleFileUpload = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const type = (req.body.type || '').toString().toUpperCase();
        const attestationname = (req.body.attestationname || '').toString();
        // Validate type
        if (!VALID_TYPES.includes(type)) {
            throw new error_middleware_1.AppError(`Invalid type "${type}". Must be one of: ${VALID_TYPES.join(', ')}`, 400, 'VALIDATION_ERROR');
        }
        // Validate attestation name
        if (!attestationname) {
            throw new error_middleware_1.AppError('Attestation name is required', 400, 'VALIDATION_ERROR');
        }
        // Validate file was uploaded
        if (!req.file) {
            throw new error_middleware_1.AppError('No file uploaded', 400, 'VALIDATION_ERROR');
        }
        // Build sanitized filename: {TYPE}_{attestationname}.{ext}
        const ext = path_1.default.extname(req.file.originalname).toLowerCase();
        const sanitizedName = sanitize(attestationname);
        const fileName = `${type}_${sanitizedName}${ext}`;
        // Save file to disk
        const uploadDir = path_1.default.join(process.cwd(), config_1.Config.EVIDENCE_UPLOAD_STORAGE_PATH);
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path_1.default.join(uploadDir, fileName);
        // Delete any existing file with the same type + attestationname (handles re-upload)
        const existingFiles = fs_1.default.readdirSync(uploadDir);
        const prefix = `${type}_${sanitizedName}`;
        for (const f of existingFiles) {
            if (path_1.default.parse(f).name === prefix) {
                fs_1.default.unlinkSync(path_1.default.join(uploadDir, f));
            }
        }
        fs_1.default.writeFileSync(filePath, req.file.buffer);
        const fileUrl = evidenceUpload_service_1.evidenceUploadService.getPublicUrl(fileName);
        res.status(200).json({
            success: true,
            fileUrl,
            fileName,
            type,
        });
    });
    /**
     * DELETE /api/v2/decentralized/fileupload
     * Body: { type, attestationname }
     */
    handleFileDelete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const type = (req.body.type || '').toString().toUpperCase();
        const attestationname = (req.body.attestationname || '').toString();
        // Validate type
        if (!VALID_TYPES.includes(type)) {
            throw new error_middleware_1.AppError(`Invalid type "${type}". Must be one of: ${VALID_TYPES.join(', ')}`, 400, 'VALIDATION_ERROR');
        }
        // Validate attestation name
        if (!attestationname) {
            throw new error_middleware_1.AppError('Attestation name is required', 400, 'VALIDATION_ERROR');
        }
        const uploadDir = path_1.default.join(process.cwd(), config_1.Config.EVIDENCE_UPLOAD_STORAGE_PATH);
        const sanitizedName = sanitize(attestationname);
        const prefix = `${type}_${sanitizedName}`;
        // Find the file matching the prefix (any extension)
        if (!fs_1.default.existsSync(uploadDir)) {
            throw new error_middleware_1.AppError('File not found', 404, 'FILE_NOT_FOUND');
        }
        const files = fs_1.default.readdirSync(uploadDir);
        const matchingFile = files.find((f) => {
            const nameWithoutExt = path_1.default.parse(f).name;
            return nameWithoutExt === prefix;
        });
        if (!matchingFile) {
            throw new error_middleware_1.AppError('File not found', 404, 'FILE_NOT_FOUND');
        }
        const filePath = path_1.default.join(uploadDir, matchingFile);
        fs_1.default.unlinkSync(filePath);
        res.status(200).json({
            success: true,
            message: `File "${matchingFile}" deleted successfully`,
        });
    });
}
exports.FileUploadController = FileUploadController;
exports.fileUploadController = new FileUploadController();
//# sourceMappingURL=fileUpload.controller.js.map