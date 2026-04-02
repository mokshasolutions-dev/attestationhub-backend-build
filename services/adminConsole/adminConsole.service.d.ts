export declare function getAdminConfig(companyId: string): import("../../modules/adminConsole/adminConsole.repository").AdminConsoleConfigRow;
export declare function updateAdminConfig(companyId: string, payload: {
    logoFile?: {
        buffer: Buffer;
        mimetype: string;
        size: number;
    };
    faviconFile?: {
        buffer: Buffer;
        mimetype: string;
        size: number;
    };
    brandColor?: string;
    removeLogo?: boolean;
    removeFavicon?: boolean;
    updatedBy: string;
}): import("../../modules/adminConsole/adminConsole.repository").AdminConsoleConfigRow;
//# sourceMappingURL=adminConsole.service.d.ts.map