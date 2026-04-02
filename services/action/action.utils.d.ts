import { IQuestionnaire, DecentralizedItem } from '../../types/detailsTypes';
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
export declare function mergeQuestionnaire(cached: IQuestionnaire[], incoming: IQuestionnaire[]): IQuestionnaire[];
/**
 * SailPoint Normalization Utility
 *
 * Enforces:
 * - Literal 4-field structure for questionnaire.
 * - Strict nulls (no undefined allowed in the final payload).
 */
export declare function normalizeToSailPoint(item: DecentralizedItem): {
    id: string | null;
    attestationname: string;
    owner: string;
    application: string | null;
    signoffstatus: string | null;
    created: string | null;
    signoffdate: string | null;
    decisiondate: string | null;
    duedate: string | null;
    modified: string | null;
    workitem: string | null;
    questionnaire: {
        QuestionId: string;
        QID: string;
        QOId: string;
        FreeText: string | null;
    }[];
    jdbcAutomationConfig: import("../../types/detailsTypes").JdbcAutomationConfig[] | null;
};
//# sourceMappingURL=action.utils.d.ts.map