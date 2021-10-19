import { AST } from '@decipad/language';
import { zip } from '@decipad/utils';
import { astNode } from './common';
import { TABLE_INPUT } from '../../utils/elementTypes';
import { TableData } from '../../components/Table/types';

interface InteractiveTableNode {
  tableData: TableData;
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
    ({ cellType: type, cells }) => {
      const colContents: AST.Expression[] = cells.map((cell) => {
        switch (type) {
          case 'number': {
            return astNode('literal', 'number' as const, Number(cell), null);
          }
          case 'string': {
            return astNode('literal', 'string' as const, cell, null);
          }
        }
      });

      return astNode('column', colContents);
    }
  );

  const cols: (AST.Column | AST.ColDef)[] = [];
  for (const [{ columnName: name }, colValue] of zip(
    tableData.columns,
    columnValues
  )) {
    cols.push(astNode('coldef', name));
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
