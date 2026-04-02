"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adminConsole_repository_1 = require("./modules/adminConsole/adminConsole.repository");
// Simulate update
(0, adminConsole_repository_1.updateAdminConsoleConfig)('companyA', {
    brandColor: '#1A73E8',
    updatedBy: 'okta_sub_test_123'
});
// Fetch updated row
const config = (0, adminConsole_repository_1.getAdminConsoleConfig)('companyA');
console.log(config);
//# sourceMappingURL=test-admin-repo.js.map