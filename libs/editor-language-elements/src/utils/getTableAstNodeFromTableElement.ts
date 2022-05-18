import {
  ELEMENT_TABLE_COLUMN_FORMULA,
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

export const getTableAstNodeFromTableElement = (
  table: TableElement
): { name: string; expression: AST.Table } => {
  const [caption, headerRow, ...dataRows] = table.children;
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
        return (
          (td && parseCell(cellType, getNodeString(td))) ??
          getNullReplacementValue(cellType)
        );
      });
      return astColumn(...items);
    })();

    return astNode('table-column', astNode('coldef', columnName), column);
  });

  return {
    name: getNodeString(caption.children[0]),
    expression: astNode('table', ...columns),
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
