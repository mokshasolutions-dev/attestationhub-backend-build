"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListsTransformer = void 0;
class ListsTransformer {
    /**
     * Convert SailPoint responseMap into flat list items
     */
    static transform(responseMap) {
        return Object.entries(responseMap).map(([attestationname, rawStatus]) => ({
            attestationname,
            signoffstatus: ListsTransformer.normalizeStatus(rawStatus),
        }));
    }
    /**
     * Normalize SailPoint status into UI status
     */
    static normalizeStatus(status) {
        if (!status) {
            // null, undefined, empty string
            return 'Pending';
        }
        const normalized = status.toLowerCase();
        switch (normalized) {
            case 'completed':
                return 'Completed';
            case 'autoclosed':
                // Autoclosed = system-completed
                return 'Autoclosed';
            case 'ready':
            case 'ready for signoff':
                // Ready = waiting for user action
                return 'Ready';
            case 'pending':
                return 'Pending';
            default:
                // Unknown / garbage from SailPoint
                return 'Pending';
        }
    }
}
exports.ListsTransformer = ListsTransformer;
//# sourceMappingURL=list.transformer.js.map