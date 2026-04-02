/**
 * Hash a password using bcrypt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compare a password with a hash
 */
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
/**
 * Generate a secure random token
 */
export declare function generateSecureToken(length?: number): string;
/**
 * Hash data using SHA-256 with salt
 */
export declare function hashWithSalt(data: string, salt?: string): string;
/**
 * Constant-time string comparison to prevent timing attacks
 */
export declare function secureCompare(a: string, b: string): boolean;
/**
 * Generate a UUID v4
 */
export declare function generateUUID(): string;
/**
 * Encrypt data using AES-256-GCM
 */
export declare function encrypt(data: string, key: string): {
    encrypted: string;
    iv: string;
    tag: string;
};
/**
 * Decrypt data using AES-256-GCM
 */
export declare function decrypt(encrypted: string, key: string, iv: string, tag: string): string;
/**
 * Sanitize string to prevent injection attacks
 */
export declare function sanitizeString(input: string): string;
//# sourceMappingURL=crypto.utils.d.ts.map