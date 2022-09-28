import { TableElement } from '@decipad/editor-types';
import { astNode } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import type { GetTableAstNodeFromTableElementResult } from './getTableAstNodeFromTableElement';
import type { ColumnParseReturn } from './headerToColumn';
import { toColumnAssign } from './toColumnAssign';

export const tableExpression = (
  table: TableElement,
  tableName: string,
  columns: ColumnParseReturn[]
): GetTableAstNodeFromTableElementResult => {
  const [firstColumn, ...restColumns] = columns;
  if (!firstColumn) {
    throw new Error('missing first column');
  }
  const firstColumnNode = astNode(
    'table-column',
    astNode('coldef', firstColumn.columnName),
    getDefined(firstColumn.expression)
  );
  return {
    id: getDefined(table.id),
    name: tableName,
    expression: astNode('table', firstColumnNode),
    columnAssigns: restColumns.map((col) =>
      toColumnAssign(table.id, tableName, col)
    ),
    parseErrors: firstColumn.parseErrors,
  };
};
