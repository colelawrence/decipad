import { parseOneExpression, AST } from '@decipad/computer';
import { astNode } from '@decipad/editor-utils';
import type { ColumnParseReturn } from './headerToColumn';
import { ParseError } from '../types';

const formulaSourceToColumn = (
  blockId: string,
  source: string
): [AST.Expression | undefined, ParseError[]] => {
  try {
    return [parseOneExpression(source), []];
  } catch (e) {
    return [
      astNode('noop'),
      [{ elementId: blockId, error: (e as Error).message }],
    ];
  }
};

export function formulaSourceToColumnAssign(
  columnName: string,
  columnFormulaBlockId: string,
  source: string
): ColumnParseReturn {
  const [exp, parseErrors] = formulaSourceToColumn(
    columnFormulaBlockId,
    source
  );

  return {
    parseErrors,
    expression: exp,
    columnName,
    elementId: columnFormulaBlockId,
  };
}
