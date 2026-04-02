"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminConfig = getAdminConfig;
exports.updateAdminConfig = updateAdminConfig;
const adminConsole_repository_1 = require("../../modules/adminConsole/adminConsole.repository");
const MAX_FILE_SIZE = 500 * 1024;
const ALLOWED_MIME = [
    'image/png',
    'image/jpeg',
    'image/svg+xml'
];
function validateBrandColor(value) {
    if (!value || typeof value !== 'string') {
        throw new Error('brandColor must be a string');
    }
    const trimmed = value.trim();
    const isNamed = trimmed === 'dark' || trimmed === 'light';
    const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed);
    const isRgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.test(trimmed);
    if (!isNamed && !isHex && !isRgb) {
        throw new Error('Invalid brandColor format');
    }
}
function validateFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 500KB limit');
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
        throw new Error('Unsupported file type');
    }
}
function getAdminConfig(companyId) {
    return (0, adminConsole_repository_1.getAdminConsoleConfig)(companyId);
}
function updateAdminConfig(companyId, payload) {
    if (!payload.logoFile &&
        !payload.faviconFile &&
        !payload.brandColor &&
        !payload.removeLogo &&
        !payload.removeFavicon) {
        throw new Error('No fields provided for update');
    }
    let logoUpdate;
    let faviconUpdate;
    if (payload.logoFile) {
        validateFile(payload.logoFile);
        logoUpdate = {
            buffer: payload.logoFile.buffer,
            mime: payload.logoFile.mimetype
        };
    }
    if (payload.removeLogo) {
        logoUpdate = null;
    }
    if (payload.faviconFile) {
        validateFile(payload.faviconFile);
        faviconUpdate = {
            buffer: payload.faviconFile.buffer,
            mime: payload.faviconFile.mimetype
        };
    }
    if (payload.removeFavicon) {
        faviconUpdate = null;
    }
    if (payload.brandColor !== undefined) {
        validateBrandColor(payload.brandColor);
    }
    (0, adminConsole_repository_1.updateAdminConsoleConfig)(companyId, {
        logo: logoUpdate,
        favicon: faviconUpdate,
        brandColor: payload.brandColor,
        updatedBy: payload.updatedBy
    });
    return (0, adminConsole_repository_1.getAdminConsoleConfig)(companyId);
}
//# sourceMappingURL=adminConsole.service.js.map