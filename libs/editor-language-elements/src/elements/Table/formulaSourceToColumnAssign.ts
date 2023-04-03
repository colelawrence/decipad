import { parseExpression } from '@decipad/computer';
import type { ColumnParseReturn } from './headerToColumn';

export function formulaSourceToColumnAssign(
  columnName: string,
  columnFormulaBlockId: string,
  source: string
): ColumnParseReturn {
  const { solution, error } = parseExpression(source);

  return {
    errors: error
      ? [
          {
            type: 'identified-error',
            errorKind: 'parse-error',
            id: columnFormulaBlockId,
            error,
            source,
          },
        ]
      : [],
    expression: solution,
    columnName,
    elementId: columnFormulaBlockId,
  };
}
