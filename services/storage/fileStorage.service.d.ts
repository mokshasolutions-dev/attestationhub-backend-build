/**
 * Interface for file storage operations.
 * Implement this interface to swap storage backends
 * (e.g., SharePoint, S3, Azure Blob) without changing consumer code.
 */
export interface IFileStorageService {
    /**
     * Save a file and return its full public URL.
     * @param fileName - Name of the file to save
     * @param content  - File content as a string
     * @returns Full public URL of the saved file
     */
    save(fileName: string, content: string): Promise<string>;
}
export declare const fileStorageService: IFileStorageService;
//# sourceMappingURL=fileStorage.service.d.ts.map