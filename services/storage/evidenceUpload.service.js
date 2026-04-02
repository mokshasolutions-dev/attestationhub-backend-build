"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evidenceUploadService = void 0;
const config_1 = require("../../config");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
class EvidenceUploadService {
    /**
     * Build the public URL for a saved evidence file.
     * Uses JDBC_FILE_BASE_URL as the base URL since it's the same server.
     */
    getPublicUrl(fileName) {
        const url = `${config_1.Config.JDBC_FILE_BASE_URL}/${config_1.Config.EVIDENCE_UPLOAD_STORAGE_PATH}/${fileName}`;
        logger_utils_1.default.info(`Evidence file URL generated: ${url}`);
        return url;
    }
}
exports.evidenceUploadService = new EvidenceUploadService();
//# sourceMappingURL=evidenceUpload.service.js.map