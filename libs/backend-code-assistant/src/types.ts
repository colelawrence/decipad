export interface ExpressionCodeResult {
  type: 'expression';
  expressionCode: string;
}

export interface AssignmentCodeResult {
  type: 'assignment';
  varname: string;
  value: string;
}

export type CodeResult = ExpressionCodeResult | AssignmentCodeResult;

export type SplitCodeResult =
  | {
      error: string;
      errorLocation: {
        line?: number;
        column?: number;
      };
    }
  | {
      error: undefined;
      blocks: CodeResult[];
    };
