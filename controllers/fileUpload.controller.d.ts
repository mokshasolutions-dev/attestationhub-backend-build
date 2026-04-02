import { Request, Response } from 'express';
export declare class FileUploadController {
    /**
     * POST /api/v2/decentralized/fileupload
     * Accepts a multipart form with: file, type, attestationname
     */
    handleFileUpload: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * DELETE /api/v2/decentralized/fileupload
     * Body: { type, attestationname }
     */
    handleFileDelete: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const fileUploadController: FileUploadController;
//# sourceMappingURL=fileUpload.controller.d.ts.map