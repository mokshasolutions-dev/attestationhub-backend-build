export interface StageActionParams {
    attestationName: string;
    action: 'start' | 'cancel';
    type: string;
}
export declare class StageActionService {
    /**
     * Performs a stage action by calling SailPoint workflow and clearing relevant cache
     */
    performStageAction(params: StageActionParams): Promise<{
        success: boolean;
    }>;
}
export declare const stageActionService: StageActionService;
//# sourceMappingURL=stageAction.service.d.ts.map