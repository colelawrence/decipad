import { AST } from '@decipad/language';
import { zip } from '@decipad/utils';
import { astNode } from '../../utils/astNode';
import { TABLE_INPUT } from '../../utils/elementTypes';
import { TableData } from '../../utils/tableTypes';
import { getNullReplacementValue, parseCell } from '../../utils/parseCell';

interface InteractiveTableNode {
  type: typeof TABLE_INPUT;
  tableData: TableData;
  children: [];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function isInteractiveTable(block: any): block is InteractiveTableNode {
  return (
    block?.type === TABLE_INPUT &&
    typeof block?.tableData?.variableName === 'string'
  );
}
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */
/* eslint-enable @typescript-eslint/no-explicit-any */

function getTableNode(tableData: TableData): AST.Table {
  const columnValues: AST.Column[] = tableData.columns.map(
    ({ cellType, cells }) => {
      return astNode(
        'column',
        cells.map((cell) => {
          return parseCell(cellType, cell) ?? getNullReplacementValue(cellType);
        })
      );
    }
  );

  const cols: (AST.Column | AST.ColDef)[] = [];
  for (const [{ columnName }, colValue] of zip(
    tableData.columns,
    columnValues
  )) {
    cols.push(astNode('coldef', columnName));
    cols.push(colValue);
  }

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
