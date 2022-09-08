import { simpleFormatUnit } from '@decipad/format';
import { AST, parseOneBlock } from '@decipad/computer';
import { TableCellType } from '@decipad/editor-types';

export const unitToAST = (
  unit: Extract<TableCellType, { kind: 'number' }>['unit']
): AST.Expression | null => {
  if (unit == null) {
    return null;
  }
  try {
    // NOTE: seems more error prone to generate an AST from the Units object than to stringify the
    // units back to the language and parse the AST.
    const formattedUnit = simpleFormatUnit(unit);
    const ast = parseOneBlock(formattedUnit);
    return ast.args.length > 0 ? (ast.args[0] as AST.Expression) : null;
  } catch {
    return null;
  }
};
