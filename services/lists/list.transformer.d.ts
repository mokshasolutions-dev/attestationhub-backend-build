export type SignoffStatus = 'Completed' | 'Pending' | 'Ready' | 'Autoclosed';
export interface AttestationListItem {
    attestationname: string;
    signoffstatus: SignoffStatus;
}
export declare class ListsTransformer {
    /**
     * Convert SailPoint responseMap into flat list items
     */
    static transform(responseMap: Record<string, string | null>): AttestationListItem[];
    /**
     * Normalize SailPoint status into UI status
     */
    private static normalizeStatus;
}
//# sourceMappingURL=list.transformer.d.ts.map