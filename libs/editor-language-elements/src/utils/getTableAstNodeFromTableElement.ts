import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyEditor,
  TableElement,
} from '@decipad/editor-types';
import { AST, parseOneExpression } from '@decipad/computer';
import {
  astColumn,
  astNode,
  getNullReplacementValue,
  parseCell,
} from '@decipad/editor-utils';
import Fraction from '@decipad/fraction';
import { getNodeString } from '@udecode/plate';
import { ParseError } from '../types';

export const getTableAstNodeFromTableElement = (
  _editor: MyEditor,
  table: TableElement
): { name: string; expression: AST.Table; parseErrors: ParseError[] } => {
  const [caption, headerRow, ...dataRows] = table.children;
  const parseErrors: ParseError[] = [];
  const columns = headerRow.children.map((th, columnIndex) => {
    const { cellType } = th;
    const columnName = getNodeString(th);

    const column = (() => {
      if (cellType.kind === 'table-formula') {
        const formula = table.children[0].children.find(
          (child) =>
            child.type === ELEMENT_TABLE_COLUMN_FORMULA &&
            child.columnId === th.id
        );

        return formulaSourceToColumn(
          formula ? getNodeString(formula) : '',
          dataRows.length
        );
      }
      const items = dataRows.map((tr) => {
        const td = tr.children[columnIndex];
        let parsed: AST.Expression | null = null;
        if (td) {
          const text = getNodeString(td);
          parsed = parseCell(cellType, text);
          if (!parsed) {
            parseErrors.push({
              error: `Invalid ${cellType.kind}`,
              elementId: td.id,
            });
          }
        }
        if (!parsed) {
          parsed = getNullReplacementValue(cellType);
        }
        return parsed;
      });
      return astColumn(...items);
    })();

    return astNode('table-column', astNode('coldef', columnName), column);
  });

  return {
    name: getNodeString(caption.children[0]),
    expression: astNode('table', ...columns),
    parseErrors,
  };
};

export function formulaSourceToColumn(
  source: string,
  dataRowCount: number
): AST.Expression {
  try {
    return parseOneExpression(source);
  } catch (e) {
    const items = Array.from({ length: dataRowCount }, () =>
      astNode('literal', 'number', new Fraction(0))
    );
    return astColumn(...items);
  }
}
