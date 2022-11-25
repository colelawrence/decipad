import { getDefined, unzip, zip } from '@decipad/utils';

import type { AST } from '..';
import { Type, build as t, InferError } from '../type';
import { getIdentifierString, getOfType, walkAst } from '../utils';
import { inferExpression, linkToAST } from '../infer';
import { Context, pushStackAndPrevious } from '../infer/context';
import { coerceTableColumnTypeIndices } from './dimensionCoersion';

const getIndexName = async (ctx: Context, table: AST.Table) => {
  const spread = table.args.find((col) => col.type === 'table-spread');
  if (spread) {
    // If the table doesn't exist or isn't a table, this is dealt with in inferTable
    return getIdentifierString(spread.args[0]);
  }

  return ctx.inAssignment;
};

export const inferTable = async (ctx: Context, table: AST.Table) => {
  if (!ctx.stack.isInGlobalScope) {
    return t.impossible(InferError.forbiddenInsideFunction('table'));
  }

  const indexName = await getIndexName(ctx, table);

  return pushStackAndPrevious(ctx, async () => {
    const columns = new Map<string, Type>();

    const getCurrentTable = () => {
      const [columnNames, columnTypes] = unzip(columns.entries());

      if (columnTypes.length === 0) {
        return t.table({
          indexName,
          columnTypes: [],
          columnNames: [],
        });
      } else {
        const [firstType, ...rest] = columnTypes.map((col) => col.reduced());

        return Type.combine(firstType, ...rest).mapType(() =>
          t.table({
            indexName,
            columnTypes: [firstType, ...rest],
            columnNames,
          })
        );
      }
    };

    const addColumn = (name: string, type: Type) => {
      columns.set(name, type);
      ctx.stack.set(getDefined(indexName), getCurrentTable());
    };

    for (const tableItem of table.args) {
      if (tableItem.type === 'table-column') {
        const name = getIdentifierString(tableItem.args[0]);

        // eslint-disable-next-line no-await-in-loop
        const type = await inferTableColumn(ctx, {
          indexName: getDefined(indexName),
          otherColumns: columns,
          columnAst: tableItem,
        });

        // Bail on error
        if (type.errorCause) return type;

        addColumn(name, type);
      } else if (tableItem.type === 'table-spread') {
        const ref = getOfType('ref', tableItem.args[0]);

        // eslint-disable-next-line no-await-in-loop
        const source = (await inferExpression(ctx, ref)).isTable();
        const { columnNames, columnTypes } = source;

        if (source.errorCause) return source;

        for (const [name, type] of zip(
          getDefined(columnNames),
          getDefined(columnTypes)
        )) {
          addColumn(name, t.column(type, 'unknown', indexName));
        }
      } else {
        throw new Error('panic: unreachable');
      }
    }

    return getCurrentTable();
  });
};

export async function inferTableColumn(
  ctx: Context,
  {
    otherColumns,
    columnAst,
    indexName,
  }: {
    otherColumns: Map<string, Type>;
    columnAst: AST.TableColumnAssign | AST.TableColumn;
    indexName: string;
  }
): Promise<Type> {
  const exp: AST.Expression =
    columnAst.type === 'table-column' ? columnAst.args[1] : columnAst.args[2];

  const type = refersToOtherColumnsByName(exp, otherColumns)
    ? await inferTableColumnPerCell(ctx, otherColumns, exp)
    : coerceTableColumnTypeIndices(await inferExpression(ctx, exp), indexName);

  linkToAST(ctx, columnAst, type);

  return type;
}

export async function inferTableColumnPerCell(
  ctx: Context,
  otherColumns: Map<string, Type>,
  columnAst: AST.Expression
) {
  const cellType = await pushStackAndPrevious(ctx, async () => {
    // Make other cells in this row available
    for (const [otherColumnName, otherColumn] of otherColumns.entries()) {
      ctx.stack.set(otherColumnName, otherColumn.reduced());
    }

    return inferExpression(ctx, columnAst);
  });

  return t.column(cellType, 'unknown');
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
