import { MyEditor, TableElement } from '@decipad/editor-types';
import { AST, Computer, IdentifiedError } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { astNode } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { headerToColumn } from './headerToColumn';
import { toColumnAssign } from './toColumnAssign';

export interface ColumnAssign {
  blockId: string;
  columnName: string;
  column?: AST.TableColumnAssign;
  errors: IdentifiedError[];
}

export interface GetTableAstNodeFromTableElementResult {
  id: string;
  name: string;
  expression: AST.Table;
  columnAssigns: ColumnAssign[];
}

export const getTableAstNodeFromTableElement = async (
  _editor: MyEditor,
  computer: Computer,
  table: TableElement
): Promise<GetTableAstNodeFromTableElementResult> => {
  const [caption, headerRow, ...dataRows] = table.children;
  const tableName = getNodeString(caption.children[0]);

  const columnAssigns = await Promise.all(
    headerRow.children.map(async (th, columnIndex) => {
      const col = await headerToColumn({
        computer,
        th,
        columnIndex,
        tableName,
        table,
        dataRows,
      });

      return toColumnAssign(table.id, tableName, col);
    })
  );

  return {
    id: getDefined(table.id),
    name: tableName,
    expression: astNode('table', astNode('tabledef', tableName)),
    columnAssigns,
  };
};
