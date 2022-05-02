import { TableElement } from '@decipad/editor-types';
import { AST, parseOneExpression } from '@decipad/language';
import {
  astColumn,
  astNode,
  getNullReplacementValue,
  parseCell,
} from '@decipad/editor-utils';
import { Node } from 'slate';
import Fraction from '@decipad/fraction';

export const getTableAstNodeFromTableElement = (
  table: TableElement
): { name: string; expression: AST.Table } => {
  const [caption, headerRow, ...dataRows] = table.children;
  const columns = headerRow.children.map((th, columnIndex) => {
    const { cellType } = th;
    const columnName = Node.string(th);

    const column = (() => {
      if (cellType.kind === 'table-formula') {
        return formulaSourceToColumn(cellType.source, dataRows.length);
      }
      const items = dataRows.map((tr) => {
        const td = tr.children[columnIndex];
        return (
          (td && parseCell(cellType, Node.string(td))) ??
          getNullReplacementValue(cellType)
        );
      });
      return astColumn(...items);
    })();

    return astNode('table-column', astNode('coldef', columnName), column);
  });

  return {
    name: Node.string(caption),
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
