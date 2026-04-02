"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const companydbmanager_1 = require("./db/companydbmanager");
const db = (0, companydbmanager_1.getCompanyDb)('companyA');
const row = db
    .prepare('SELECT * FROM admin_console_config WHERE id = 1')
    .get();
console.log(row);
//# sourceMappingURL=test-db.js.map