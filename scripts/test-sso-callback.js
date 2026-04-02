"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
/**
 * SSO Callback Simulation Script
 * This script calls the /auth/okta/callback endpoint and inspects the Set-Cookie header.
 */
async function simulateSSOCallback() {
    const baseUrl = `http://localhost:${config_1.Config.PORT}`;
    const callbackUrl = `${baseUrl}/api/auth/okta/callback`;
    console.log('--- SSO Callback Simulation ---');
    console.log(`Target URL: ${callbackUrl}`);
    console.log(`Config UI_REDIRECT_URL: ${config_1.Config.UI_REDIRECT_URL}`);
    console.log(`Config AUTH_COOKIE_DOMAIN: ${config_1.Config.AUTH_COOKIE_DOMAIN}`);
    console.log('-------------------------------\n');
    try {
        const response = await axios_1.default.get(callbackUrl, {
            maxRedirects: 0, // Don't follow redirect so we can inspect headers
            validateStatus: (status) => status === 302, // Expect redirect
        });
        const setCookie = response.headers['set-cookie'];
        const logOutput = [
            `Status: ${response.status}`,
            `Redirect Location: ${response.headers.location}`,
            `Set-Cookie: ${JSON.stringify(setCookie)}`,
            `Config Domain: ${config_1.Config.AUTH_COOKIE_DOMAIN}`,
            `Config URL: ${config_1.Config.UI_REDIRECT_URL}`
        ].join('\n');
        const fs = require('fs');
        fs.writeFileSync('sso-test-results.txt', logOutput);
        console.log('Results written to sso-test-results.txt');
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error('Error simulating SSO callback:', error.message);
            if (error.response) {
                console.error('Response Data:', error.response.data);
            }
        }
        else {
            console.error('Unexpected error:', error);
        }
    }
}
simulateSSOCallback().catch(console.error);
//# sourceMappingURL=test-sso-callback.js.map