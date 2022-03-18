import { getDefined, unzip, zip } from '@decipad/utils';
import { produce } from 'immer';

import type { AST } from '..';
import { Type, build as t, InferError } from '../type';
import { equalOrUnknown, getIdentifierString, getOfType, walk } from '../utils';
import { inferExpression, linkToAST } from '../infer';
import { Context, pushStackAndPrevious } from '../infer/context';
import { linearizeType } from '../dimtools/common';

const coerceIndices = (
  type: Type,
  indexName: string | null,
  tableLength: 'unknown' | number
) => {
  if (type.columnSize == null) {
    // Because we're so very nice, allow `Column = 1` as syntax sugar.
    return t.column(type, tableLength, indexName);
  }

  // We want our table index on top
  const hasIndex = linearizeType(type).some((t) => t.indexedBy === indexName);
  if (!hasIndex && !equalOrUnknown(type.columnSize ?? -1, tableLength)) {
    // The column size isn't equivalent!
    return t.impossible('Incompatible column sizes');
  }

  return produce(type, (t) => {
    t.indexedBy = indexName;
  });
};

export const findTableSize = async (ctx: Context, table: AST.Table) => {
  const spread = table.args.find((col) => col.type === 'table-spread');
  if (spread) {
    const tableName = getIdentifierString(spread.args[0]);
    const existingTable = ctx.stack.get(tableName);
    // If the table doesn't exist or isn't a table, this is dealt with in inferTable
    return [tableName, existingTable?.tableLength ?? 'unknown'] as const;
  }

  return pushStackAndPrevious(ctx, async () => {
    for (const col of table.args) {
      const expression = getOfType('table-column', col).args[1];

      /* eslint-disable-next-line no-await-in-loop */
      const inferred = await inferExpression(ctx, expression);
      if (inferred.columnSize != null) {
        return [ctx.inAssignment, inferred.columnSize] as const;
      }
    }

    return [ctx.inAssignment, table.args.length ? 1 : 0] as const;
  });
};

export const inferTable = async (ctx: Context, table: AST.Table) => {
  const [indexName, tableLength] = await findTableSize(ctx, table);

  return pushStackAndPrevious(ctx, async () => {
    const columns = new Map<string, Type>();

    const getCurrentTable = () => {
      const [columnNames, columnTypes] = unzip(columns.entries());

      if (columnTypes.length === 0) {
        return t.impossible(InferError.unexpectedEmptyTable());
      } else {
        const [firstType, ...rest] = columnTypes.map((col) => col.reduced());

        return Type.combine(firstType, ...rest).mapType(() =>
          t.table({
            indexName,
            length: tableLength,
            columnTypes: [firstType, ...rest],
            columnNames,
          })
        );
      }
    };

    const addColumn = (name: string, type: Type) => {
      type = coerceIndices(type, indexName, tableLength);

      columns.set(name, type);
      ctx.stack.set(getDefined(indexName), getCurrentTable());
    };

    for (const tableItem of table.args) {
      if (tableItem.type === 'table-column') {
        const [colDef, expr] = tableItem.args;
        const name = getIdentifierString(colDef);

        // eslint-disable-next-line no-await-in-loop
        const type = await inferTableColumn(ctx, {
          indexName,
          otherColumns: columns,
          columnAst: expr,
          linkTo: tableItem,
          tableLength,
        });

        // Bail on error
        if (type.errorCause) return type;

        addColumn(name, type);
      } else if (tableItem.type === 'table-spread') {
        const ref = getOfType('ref', tableItem.args[0]);

        // eslint-disable-next-line no-await-in-loop
        const source = (await inferExpression(ctx, ref)).isTable();
        const { tableLength, columnNames, columnTypes } = source;

        if (source.errorCause) return source;

        for (const [name, type] of zip(
          getDefined(columnNames),
          getDefined(columnTypes)
        )) {
          addColumn(name, t.column(type, getDefined(tableLength), indexName));
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
    linkTo = columnAst,
    tableLength,
    indexName,
  }: {
    otherColumns: Map<string, Type>;
    columnAst: AST.Expression;
    linkTo?: AST.Node;
    tableLength: number | 'unknown';
    indexName: string | null;
  }
): Promise<Type> {
  const type = refersToOtherColumnsByName(columnAst, otherColumns)
    ? await inferTableColumnPerCell(ctx, otherColumns, columnAst, tableLength)
    : await inferExpression(ctx, columnAst);

  return coerceIndices(linkToAST(ctx, linkTo, type), indexName, tableLength);
}

export async function inferTableColumnPerCell(
  ctx: Context,
  otherColumns: Map<string, Type>,
  columnAst: AST.Expression,
  tableLength: number | 'unknown'
) {
  const cellType = await pushStackAndPrevious(ctx, async () => {
    // Make other cells in this row available
    for (const [otherColumnName, otherColumn] of otherColumns.entries()) {
      ctx.stack.top.set(otherColumnName, otherColumn.reduced());
    }

    return inferExpression(ctx, columnAst);
  });

  return t.column(cellType, tableLength);
}

export function refersToOtherColumnsByName(
  expr: AST.Expression,
  columns: Map<string, unknown>
) {
  let isReferringToOtherColumnByName = false;

  walk(expr, (node) => {
    if (node.type === 'ref') {
      const name = getIdentifierString(node);

      if (columns.has(name)) {
        isReferringToOtherColumnByName = true;
      }
    }
  });

  return isReferringToOtherColumnByName;
}
