import { AST } from '@decipad/language';
import { ELEMENT_TABLE_INPUT } from '@decipad/editor-types';
import { astNode } from '../../utils/astNode';
import { TableData } from '../../types';
import { getNullReplacementValue, parseCell } from '../../utils/parseCell';

interface InteractiveTableNode {
  type: typeof ELEMENT_TABLE_INPUT;
  tableData: TableData;
  children: [];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function isInteractiveTable(block: any): block is InteractiveTableNode {
  return (
    block?.type === ELEMENT_TABLE_INPUT &&
    typeof block?.tableData?.variableName === 'string'
  );
}
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */
/* eslint-enable @typescript-eslint/no-explicit-any */

function getTableNode(tableData: TableData): AST.Table {
  const cols: AST.Table['args'] = tableData.columns.map(
    ({ columnName, cellType, cells }) => {
      const cellNodes = cells.map(
        (cell) => parseCell(cellType, cell) ?? getNullReplacementValue(cellType)
      );

      return astNode(
        'table-column',
        astNode('coldef', columnName),
        astNode('column', astNode('column-items', ...cellNodes))
      );
    }
  );

  return astNode('table', ...cols);
}

export interface ExtractedTable {
  name: string;
  node: AST.Table;
}

const weakMapMemoize = (
  fn: (arg: InteractiveTableNode) => ExtractedTable | null
) => {
  const cache = new WeakMap<InteractiveTableNode, ExtractedTable | null>();

  return (arg: InteractiveTableNode) => {
    const cached = cache.get(arg) ?? fn(arg);
    cache.set(arg, cached);
    return cached;
  };
};

export const extractTable = weakMapMemoize(
  ({ tableData }: InteractiveTableNode): ExtractedTable | null => {
    if (!tableData.variableName) return null;

    const node = getTableNode(tableData);

    if (node) {
      return { name: tableData.variableName, node };
    }
    return null;
  }
);
