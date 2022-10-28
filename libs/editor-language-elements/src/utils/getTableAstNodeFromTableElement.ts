import { MyEditor, TableElement } from '@decipad/editor-types';
import { AST, Computer, IdentifiedError } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { headerToColumn } from './headerToColumn';
import { tableExpression } from './tableExpression';

export interface ColumnAssign {
  blockId: string;
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

  const columns = await Promise.all(
    headerRow.children.map(async (th, columnIndex) =>
      headerToColumn({ computer, th, columnIndex, tableName, table, dataRows })
    )
  );

  return tableExpression(table, tableName, columns);
};
