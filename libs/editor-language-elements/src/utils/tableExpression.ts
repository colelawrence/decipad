import { TableElement } from '@decipad/editor-types';
import { astNode } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { getExprRef } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import type { GetTableAstNodeFromTableElementResult } from './getTableAstNodeFromTableElement';
import type { ColumnParseReturn } from './headerToColumn';
import { toColumnAssign } from './toColumnAssign';

export const tableExpression = (
  table: TableElement,
  columns: ColumnParseReturn[]
): GetTableAstNodeFromTableElementResult => {
  const [caption] = table.children;
  const tableName = getNodeString(caption.children[0]);
  const innerTableName = getExprRef(table.id);

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
      toColumnAssign(table.id, innerTableName, col)
    ),
    parseErrors: firstColumn.parseErrors,
  };
};
