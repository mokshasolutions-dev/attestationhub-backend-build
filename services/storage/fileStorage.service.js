"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileStorageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../config");
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
/**
 * Default implementation: writes files to local disk.
 * Storage path and base URL are driven by Config (env vars).
 */
class LocalFileStorageService {
    async save(fileName, content) {
        const storagePath = config_1.Config.JDBC_FILE_STORAGE_PATH;
        const dir = path_1.default.join(process.cwd(), storagePath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const filePath = path_1.default.join(dir, fileName);
        fs_1.default.writeFileSync(filePath, content);
        const publicUrl = `${config_1.Config.JDBC_FILE_BASE_URL}/${storagePath}/${fileName}`;
        logger_utils_1.default.info(`File saved locally: ${filePath} → ${publicUrl}`);
        return publicUrl;
    }
}
// Export singleton – swap this export to switch storage backends
exports.fileStorageService = new LocalFileStorageService();
//# sourceMappingURL=fileStorage.service.js.map