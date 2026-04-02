"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyDb = getCompanyDb;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const config_1 = __importDefault(require("../config"));
const dbCache = new Map();
function initializeSchema(db) {
    // Critical for PM2 cluster mode
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');
    db.exec(`
    CREATE TABLE IF NOT EXISTS admin_console_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),

      logo BLOB,
      logo_mime TEXT,

      favicon BLOB,
      favicon_mime TEXT,

      brand_color TEXT,

      updated_by TEXT NOT NULL,
      updated_at DATETIME NOT NULL
    );

    INSERT OR IGNORE INTO admin_console_config
    (id, brand_color, updated_by, updated_at)
    VALUES (1, '#FA4D69', 'system', CURRENT_TIMESTAMP);
  `);
}
function getCompanyDb(companyId) {
    if (!companyId) {
        throw new Error('companyId is required to get database');
    }
    if (dbCache.has(companyId)) {
        return dbCache.get(companyId);
    }
    const basePath = path_1.default.resolve(config_1.default.DB_BASE_PATH);
    if (!fs_1.default.existsSync(basePath)) {
        fs_1.default.mkdirSync(basePath, { recursive: true });
    }
    const dbPath = path_1.default.join(basePath, `${companyId}.db`);
    const db = new better_sqlite3_1.default(dbPath);
    initializeSchema(db);
    dbCache.set(companyId, db);
    return db;
}
//# sourceMappingURL=companydbmanager.js.map