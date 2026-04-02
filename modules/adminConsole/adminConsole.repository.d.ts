export interface AdminConsoleConfigRow {
    logo: Buffer | null;
    logo_mime: string | null;
    favicon: Buffer | null;
    favicon_mime: string | null;
    brand_color: string | null;
    updated_by: string;
    updated_at: string;
}
export declare function getAdminConsoleConfig(companyId: string): AdminConsoleConfigRow;
export declare function updateAdminConsoleConfig(companyId: string, updates: {
    logo?: {
        buffer: Buffer;
        mime: string;
    } | null;
    favicon?: {
        buffer: Buffer;
        mime: string;
    } | null;
    brandColor?: string;
    updatedBy: string;
}): void;
//# sourceMappingURL=adminConsole.repository.d.ts.map