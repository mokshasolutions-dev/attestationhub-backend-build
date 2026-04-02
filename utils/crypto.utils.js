"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateSecureToken = generateSecureToken;
exports.hashWithSalt = hashWithSalt;
exports.secureCompare = secureCompare;
exports.generateUUID = generateUUID;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.sanitizeString = sanitizeString;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, config_1.Config.BCRYPT_SALT_ROUNDS);
}
/**
 * Compare a password with a hash
 */
async function comparePassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
/**
 * Generate a secure random token
 */
function generateSecureToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
/**
 * Hash data using SHA-256 with salt
 */
function hashWithSalt(data, salt) {
    const actualSalt = salt ?? config_1.Config.API_KEY_SALT;
    return crypto_1.default
        .createHmac('sha256', actualSalt)
        .update(data)
        .digest('hex');
}
/**
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a, b) {
    if (a.length !== b.length) {
        // Still perform comparison to maintain constant time
        crypto_1.default.timingSafeEqual(Buffer.from(a), Buffer.from(a));
        return false;
    }
    return crypto_1.default.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
/**
 * Generate a UUID v4
 */
function generateUUID() {
    return crypto_1.default.randomUUID();
}
/**
 * Encrypt data using AES-256-GCM
 */
function encrypt(data, key) {
    const iv = crypto_1.default.randomBytes(16);
    const keyBuffer = crypto_1.default.scryptSync(key, config_1.Config.API_KEY_SALT, 32);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', keyBuffer, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        encrypted,
        iv: iv.toString('hex'),
        tag: cipher.getAuthTag().toString('hex'),
    };
}
/**
 * Decrypt data using AES-256-GCM
 */
function decrypt(encrypted, key, iv, tag) {
    const keyBuffer = crypto_1.default.scryptSync(key, config_1.Config.API_KEY_SALT, 32);
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', keyBuffer, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
/**
 * Sanitize string to prevent injection attacks
 */
function sanitizeString(input) {
    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/['"`;]/g, '') // Remove quotes and semicolons
        .trim();
}
//# sourceMappingURL=crypto.utils.js.map