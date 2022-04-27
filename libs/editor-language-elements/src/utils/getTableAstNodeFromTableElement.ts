import { TableElement } from '@decipad/editor-types';
import { AST } from '@decipad/language';
import {
  astNode,
  getNullReplacementValue,
  parseCell,
} from '@decipad/editor-utils';
import { Node } from 'slate';

export const getTableAstNodeFromTableElement = (
  table: TableElement
): { name: string; expression: AST.Table } => {
  const [caption, headerRow, ...dataRows] = table.children;
  const columns = headerRow.children.map((th, columnIndex) => {
    const { cellType } = th;
    const columnName = Node.string(th);
    const column = dataRows.map((tr) => {
      const td = tr.children[columnIndex];
      return (
        (td && parseCell(cellType, Node.string(td))) ??
        getNullReplacementValue(cellType)
      );
    });
    return astNode(
      'table-column',
      astNode('coldef', columnName),
      astNode('column', astNode('column-items', ...column))
    );
  });

  return {
    name: Node.string(caption),
    expression: astNode('table', ...columns),
  };
};
