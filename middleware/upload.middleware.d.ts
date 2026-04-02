import multer from 'multer';
/**
 * Configured multer instance for evidence file uploads
 * Uses memoryStorage so the file is saved AFTER text fields are parsed
 * (diskStorage runs before body fields are available)
 * - Max size: 2 MB
 * - Allowed types: PDF, images
 */
export declare const evidenceUpload: multer.Multer;
//# sourceMappingURL=upload.middleware.d.ts.map