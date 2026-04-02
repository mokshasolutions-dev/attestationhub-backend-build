import { Request, Response } from 'express';
/**
 * GET /admin/config
 * owner must be sent as query param for GET
 */
export declare function getAdminConfigController(req: Request, res: Response): void;
/**
 * POST /admin/config
 * owner must be sent in form-data
 */
export declare function updateAdminConfigController(req: Request, res: Response): void;
/**
 * GET /admin/logo
 */
export declare function getLogoController(req: Request, res: Response): void;
/**
 * GET /admin/favicon
 */
export declare function getFaviconController(req: Request, res: Response): void;
//# sourceMappingURL=adminConsole.controller.d.ts.map