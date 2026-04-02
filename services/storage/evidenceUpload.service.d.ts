declare class EvidenceUploadService {
    /**
     * Build the public URL for a saved evidence file.
     * Uses JDBC_FILE_BASE_URL as the base URL since it's the same server.
     */
    getPublicUrl(fileName: string): string;
}
export declare const evidenceUploadService: EvidenceUploadService;
export {};
//# sourceMappingURL=evidenceUpload.service.d.ts.map