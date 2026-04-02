"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminConsoleConfig = getAdminConsoleConfig;
exports.updateAdminConsoleConfig = updateAdminConsoleConfig;
const companydbmanager_1 = require("../../db/companydbmanager");
function getAdminConsoleConfig(companyId) {
    const db = (0, companydbmanager_1.getCompanyDb)(companyId);
    const row = db
        .prepare(`SELECT logo, logo_mime, favicon, favicon_mime, brand_color, updated_by, updated_at
       FROM admin_console_config
       WHERE id = 1`)
        .get();
    return row;
}
function updateAdminConsoleConfig(companyId, updates) {
    const db = (0, companydbmanager_1.getCompanyDb)(companyId);
    const transaction = db.transaction(() => {
        const current = getAdminConsoleConfig(companyId);
        const newLogo = updates.logo === undefined
            ? current.logo
            : updates.logo === null
                ? null
                : updates.logo.buffer;
        const newLogoMime = updates.logo === undefined
            ? current.logo_mime
            : updates.logo === null
                ? null
                : updates.logo.mime;
        const newFavicon = updates.favicon === undefined
            ? current.favicon
            : updates.favicon === null
                ? null
                : updates.favicon.buffer;
        const newFaviconMime = updates.favicon === undefined
            ? current.favicon_mime
            : updates.favicon === null
                ? null
                : updates.favicon.mime;
        const newBrandColor = updates.brandColor === undefined
            ? current.brand_color
            : updates.brandColor;
        db.prepare(`
      UPDATE admin_console_config
      SET
        logo = ?,
        logo_mime = ?,
        favicon = ?,
        favicon_mime = ?,
        brand_color = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(newLogo, newLogoMime, newFavicon, newFaviconMime, newBrandColor, updates.updatedBy);
    });
    transaction();
}
//# sourceMappingURL=adminConsole.repository.js.map