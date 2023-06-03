export interface ContextStats {
  inferProgramCount: number;
  inferStatementCount: number;
  inferExpressionCount: number;
  totalInferProgramTimeMs: number;
}

export const initialInferStats = (): ContextStats => ({
  totalInferProgramTimeMs: 0,
  inferProgramCount: 0,
  inferStatementCount: 0,
  inferExpressionCount: 0,
});
