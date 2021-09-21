import { Node } from 'slate';
import { AST } from '@decipad/language';
import { ELEMENT_TABLE } from '@udecode/plate';
import { zip } from '@decipad/utils';
import { astNode } from './common';

export interface InteractiveTable {
  type: typeof ELEMENT_TABLE;
  id: string;
  children: AnyRow[];
}

// Table header
interface TitleTR {
  type: 'tr';
  id?: string;
  attributes?: { isHeader: true };
  children: InteractiveTableHeadingTH[];
}
interface InteractiveTableHeadingTH {
  type: 'th';
  id?: string;
  attributes?: { title?: boolean };
  children: [{ text: string }];
}

// Column names
interface ColumnNamesTR {
  type: 'tr';
  id?: string;
  attributes?: { isColumnNames: true };
  children: InteractiveTableColumnNamesTH[];
}
interface InteractiveTableColumnNamesTH {
  type: 'th';
  id?: string;
  attributes?: { title?: boolean };
  children: [{ text: string }];
}

// Table data
interface DataTR {
  type: 'tr';
  id?: string;
  children: InteractiveTableTD[];
}
interface InteractiveTableTD {
  type: 'td';
  id?: string;
  children: [{ text: string }];
}

type AnyRow = DataTR | TitleTR | ColumnNamesTR;

/* eslint-disable @typescript-eslint/no-explicit-any */
function isDataTr(arg: AnyRow): arg is DataTR {
  return (
    arg?.type === 'tr' &&
    !(arg as any).attributes?.isHeader &&
    !(arg as any).attributes?.isColumnNames
  );
}

function isTitleTr(row: AnyRow): row is TitleTR {
  return row != null && row.type === 'tr' && (row as any).attributes?.isHeader;
}

function isColumnNamesTr(row: AnyRow): row is ColumnNamesTR {
  return (
    row != null && row.type === 'tr' && (row as any).attributes?.isColumnNames
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isInteractiveTable(block: any): block is InteractiveTable {
  return (
    block?.type === ELEMENT_TABLE &&
    Array.isArray(block.children) &&
    block.children.some(isDataTr) &&
    block.children.some(isTitleTr) &&
    block.children.some(isColumnNamesTr)
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function getVariableName(rows: AnyRow[]): string | null {
  const titleTr = rows.find(isTitleTr);
  const titleTh = titleTr?.children?.find((child) => child.attributes?.title);

  if (titleTh) {
    return Node.string(titleTh) || null;
  }
  return null;
}

function extractColumnNames(rows: AnyRow[]): string[] | null {
  const columnNamesTr = rows.find(isColumnNamesTr);
  const columnNames = columnNamesTr?.children.map(
    (th) => Node.string(th) || null
  );

  if (columnNames?.every((name) => name != null)) {
    return columnNames as string[];
  }
  return null;
}

function getTableNode(columnNames: string[], dataRows: DataTR[]): AST.Table {
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
    const variableName = getVariableName(block.children);
    const dataRows = block.children.filter(isDataTr) as unknown[] as DataTR[];
    const columnNames = extractColumnNames(block.children);

    if (variableName && dataRows.length && columnNames) {
      return {
        name: variableName,
        node: getTableNode(columnNames, dataRows),
      };
    }
    return null;
  }
);
