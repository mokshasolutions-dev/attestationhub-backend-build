import { Request, Response } from 'express';
export declare class ActionController {
    private serviceMap;
    private resolveType;
    /**
     * SAVE
     * POST /api/v2/:type/save
     */
    handleSave: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * SIGNOFF
     * POST /api/v2/:type/signoff
     */
    handleSignoff: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const actionController: ActionController;
//# sourceMappingURL=action.controller.d.ts.map