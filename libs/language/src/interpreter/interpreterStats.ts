export interface InterpreterStats {
  evaluateCount: number;
  evaluateStatementCount: number;
}

export const initialInterpreterStats = (): InterpreterStats => ({
  evaluateCount: 0,
  evaluateStatementCount: 0,
});
