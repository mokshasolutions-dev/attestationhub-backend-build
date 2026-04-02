"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeQuestionnaire = mergeQuestionnaire;
exports.normalizeToSailPoint = normalizeToSailPoint;
/**
 * Deterministic Questionnaire Merge Utility
 *
 * Rules:
 * - Cached questionnaire is the base (source of truth for structure).
 * - Incoming questionnaire overwrites values for matching identifiers.
 * - Incoming `null` explicitly blanks a field.
 * - Incoming `undefined` or missing entry retains the cached value.
 * - Never drops entries from the cached structure.
 */
function mergeQuestionnaire(cached, incoming) {
    if (!incoming || !Array.isArray(incoming))
        return cached;
    // Create a map for fast lookup of incoming answers
    const incomingMap = new Map();
    for (const item of incoming) {
        const id = item.QID || item.QuestionId;
        if (id) {
            incomingMap.set(id, item);
        }
    }
    return cached.map((q) => {
        const id = q.QID || q.QuestionId;
        const incomingMatch = id ? incomingMap.get(id) : null;
        if (!incomingMatch)
            return q;
        // Merge logic: Overwrite only if defined or null
        // We strictly use the cached object as the structure base
        return {
            ...q,
            QOId: incomingMatch.QOId !== undefined ? incomingMatch.QOId : q.QOId,
            FreeText: incomingMatch.FreeText !== undefined ? incomingMatch.FreeText : q.FreeText,
        };
    });
}
/**
 * SailPoint Normalization Utility
 *
 * Enforces:
 * - Literal 4-field structure for questionnaire.
 * - Strict nulls (no undefined allowed in the final payload).
 */
function normalizeToSailPoint(item) {
    const questionnaire = Array.isArray(item.questionnaire)
        ? item.questionnaire.map((q) => ({
            QuestionId: q.QuestionId ?? null,
            QID: q.QID ?? null,
            QOId: q.QOId ?? null,
            FreeText: q.FreeText ?? null,
        }))
        : [];
    return {
        id: item.id ? String(item.id) : null,
        attestationname: item.attestationname ?? null,
        owner: item.owner ?? null,
        application: item.application ?? null,
        signoffstatus: item.signoffstatus ?? null,
        created: item.created ?? null,
        signoffdate: item.signoffdate ?? null,
        decisiondate: item.decisiondate ?? null,
        duedate: item.duedate ?? null,
        modified: item.modified ?? null,
        workitem: item.workitem ?? null,
        questionnaire,
        jdbcAutomationConfig: item.jdbcAutomationConfig ?? null,
    };
}
//# sourceMappingURL=action.utils.js.map