import { mutateAst, AST, decilang } from '@decipad/language';
import { Program, ProgramBlock } from '../types';
import { getDefinedSymbol, getIdentifierString } from '../utils';
import { getExprRef, isExprRef } from '.';

/** Deal with tech debt: We have places where we refer to whole-columns by writing the column ID.
 * Make sure everyone refers to that by using tableId.ColumnId and then delete this please
 */
export function removeLegacyTableColumnReferences(program: Program) {
  const tableRefsToIds = new Map(
    program.flatMap((v) => {
      if (v.block?.args[0]?.type === 'table') {
        const tableName = getIdentifierString(v.block.args[0].args[0]);
        return [
          [tableName, v.id],
          [getExprRef(v.id), v.id],
        ];
      }
      return [];
    })
  );
  const idsToTableColumns = new Map(
    program.flatMap((v) => {
      if (v.block?.args[0]?.type === 'table-column-assign') {
        const stat = v.block.args[0];
        const tableName = getDefinedSymbol(stat, true);
        const tableId = tableName && tableRefsToIds.get(tableName);
        const columnName = getDefinedColumn(stat);
        if (columnName && tableId) {
          return [[getExprRef(v.id), [getExprRef(tableId), getExprRef(v.id)]]];
        }
      }
      return [];
    })
  );

  let inTableColumnAssign: string | undefined;
  return program.map((block: ProgramBlock): ProgramBlock => {
    if (block.type === 'identified-block') {
      if (block.block.args[0].type === 'table-column-assign') {
        const tableRef = tableRefsToIds.get(
          block.block.args[0].args[0].args[0]
        );
        inTableColumnAssign = tableRef && getExprRef(tableRef);
      } else {
        inTableColumnAssign = undefined;
      }

      return {
        ...block,
        block: mutateAst(block.block, (node) => {
          if (node.type === 'ref' && isExprRef(node.args[0])) {
            const columnId = node.args[0];
            const tableColumn = idsToTableColumns.get(columnId);
            if (tableColumn && tableColumn[0] !== inTableColumnAssign) {
              return decilang<AST.PropertyAccess>`${{
                name: tableColumn[0],
              }}.${{ name: tableColumn[1] }}`;
            }
          }
          return node;
        }) as AST.Block,
      };
    }
    return block;
  });
}

function getDefinedColumn(arg0: AST.Statement) {
  switch (arg0.type) {
    case 'table-column-assign':
      return arg0.args[1].args[0];
  }
  return undefined;
}
