import { astNode } from '@decipad/editor-utils';
import { ColumnAssign } from './getTableAstNodeFromTableElement';
import { ColumnParseReturn } from './headerToColumn';

export const toColumnAssign = (
  tableBlockId: string,
  tableName: string,
  column: ColumnParseReturn
): ColumnAssign => {
  return {
    blockId: column.elementId ?? tableBlockId,
    column:
      column.expression &&
      astNode(
        'table-column-assign',
        astNode('tablepartialdef', tableName),
        astNode('coldef', column.columnName),
        column.expression
      ),
    errors: column.errors,
    columnName: column.columnName,
  };
};
