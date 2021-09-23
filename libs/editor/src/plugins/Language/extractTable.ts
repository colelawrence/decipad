import { Node } from 'slate';
import { AST } from '@decipad/language';
import { ELEMENT_TABLE } from '@udecode/plate';
import { zip } from '@decipad/utils';
import { astNode } from './common';
import {
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TBODY,
  ELEMENT_THEAD,
} from '../../utils/elementTypes';
import { BodyTr, InteractiveTable } from '../InteractiveTable/table';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function isInteractiveTable(block: any): block is InteractiveTable {
  return (
    block?.type === ELEMENT_TABLE &&
    Array.isArray(block.children) &&
    block.children.length === 3 &&
    block.children[0].type === ELEMENT_TABLE_CAPTION &&
    block.children[1].type === ELEMENT_THEAD &&
    block.children[2].type === ELEMENT_TBODY
  );
}
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */
/* eslint-enable @typescript-eslint/no-explicit-any */

function getVariableName(table: InteractiveTable): string | null {
  const [caption] = table.children;
  if (caption) {
    return Node.string(caption) || null;
  }
  return null;
}

function extractColumnNames(table: InteractiveTable): string[] | null {
  const [, thead] = table.children;
  const [columnNamesTr] = thead.children;
  const columnNames = columnNamesTr.children.map(
    (th) => Node.string(th) || null
  );

  if (columnNames?.every((name) => name != null)) {
    return columnNames as string[];
  }
  return null;
}

function getTableNode(columnNames: string[], dataRows: BodyTr[]): AST.Table {
  const columns: AST.Column[] = columnNames.map((_, columnIndex) => {
    const colContents: AST.Expression[] = dataRows.map((row) => {
      const cell = Node.string(row.children[columnIndex]);
      return astNode('literal', 'string' as const, cell, null);
    });

    return astNode('column', colContents);
  });

  const cols: (AST.Column | AST.ColDef)[] = [];
  for (const [colName, colValue] of zip(columnNames, columns)) {
    cols.push(astNode('coldef', colName));
    cols.push(colValue);
  }

  return astNode('table', ...cols);
}

export interface ExtractedTable {
  name: string;
  node: AST.Table;
}

const weakMapMemoize = (
  fn: (arg: InteractiveTable) => ExtractedTable | null
) => {
  const cache = new WeakMap<InteractiveTable, ExtractedTable | null>();

  return (arg: InteractiveTable) => {
    const cached = cache.get(arg) ?? fn(arg);
    cache.set(arg, cached);
    return cached;
  };
};

export const extractTable = weakMapMemoize(
  (block: InteractiveTable): ExtractedTable | null => {
    const variableName = getVariableName(block);

    const [, , tbody] = block.children;
    const dataRows = tbody.children;

    const columnNames = extractColumnNames(block);

    if (variableName && dataRows.length && columnNames) {
      return {
        name: variableName,
        node: getTableNode(columnNames, dataRows),
      };
    }
    return null;
  }
);
