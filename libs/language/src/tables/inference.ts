import { getDefined } from '@decipad/utils';

import produce from 'immer';
import type { AST } from '..';
import { Type, buildType as t, InferError } from '../type';
import { getIdentifierString, walkAst } from '../utils';
import { inferExpression, linkToAST } from '../infer';
import { Context, pushTableContext } from '../infer/context';
import { coerceTableColumnTypeIndices } from './dimensionCoersion';
import { sortType } from '../infer/sortType';

export const inferTable = async (ctx: Context, table: AST.Table) => {
  if (!ctx.stack.isInGlobalScope) {
    return t.impossible(InferError.forbiddenInsideFunction('table'));
  }

  const tableName = getIdentifierString(table.args[0]);
  if (ctx.stack.has(tableName, 'function')) {
    return t.impossible(InferError.duplicatedName(tableName));
  }

  const tableType = await pushTableContext(ctx, tableName, async () => {
    ctx.stack.createNamespace(tableName, 'function');

    for (const tableItem of table.args.slice(1)) {
      if (tableItem.type === 'table-column') {
        // eslint-disable-next-line no-await-in-loop
        await inferTableColumn(ctx, {
          tableName,
          columnAst: tableItem,
          columnName: getIdentifierString(tableItem.args[0]),
        });
      } else {
        throw new Error('panic: unreachable');
      }
    }

    return sortType(getDefined(ctx.stack.get(tableName, 'function')));
  });

  return tableType;
};

export async function inferTableColumn(
  ctx: Context,
  {
    columnAst,
    tableName,
    columnName,
  }: {
    columnAst: AST.TableColumnAssign | AST.TableColumn;
    tableName: string;
    columnName: string;
  }
): Promise<Type> {
  ctx.stack.createNamespace(tableName, 'function');
  const otherColumns = getDefined(
    ctx.stack.getNamespace(tableName, 'function')
  );

  const exp: AST.Expression =
    columnAst.type === 'table-column' ? columnAst.args[1] : columnAst.args[2];

  let type = await pushTableContext(ctx, tableName, async () => {
    if (refersToOtherColumnsByName(exp, otherColumns)) {
      return inferTableColumnPerCell(ctx, otherColumns, exp);
    } else {
      return coerceTableColumnTypeIndices(
        await inferExpression(ctx, exp),
        tableName
      );
    }
  });

  if (columnAst.type === 'table-column-assign') {
    type = produce(type, (t) => {
      t.atParentIndex ??= columnAst.args[3] ?? null;
    });
  }

  linkToAST(columnAst, type);

  if (type.errorCause) {
    return type;
  }

  ctx.stack.setNamespaced(
    [tableName, columnName],
    type,
    'function',
    ctx.statementId
  );

  return type;
}

export async function inferTableColumnPerCell(
  ctx: Context,
  otherColumns: Map<string, Type>,
  columnAst: AST.Expression
) {
  // Make other cells in this row available
  for (const [otherColumnName, otherColumn] of otherColumns.entries()) {
    ctx.stack.set(otherColumnName, otherColumn);
  }

  return inferExpression(ctx, columnAst);
}

export function refersToOtherColumnsByName(
  expr: AST.Expression,
  columns: Map<string, unknown>
) {
  let isReferringToOtherColumnByName = false;

  walkAst(expr, (node) => {
    if (node.type === 'ref') {
      const name = getIdentifierString(node);

      if (columns.has(name)) {
        isReferringToOtherColumnByName = true;
      }
    }
  });

  return isReferringToOtherColumnByName;
}
