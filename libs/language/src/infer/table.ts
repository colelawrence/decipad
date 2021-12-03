import { getDefined, zip } from '@decipad/utils';
import { produce } from 'immer';

import type { AST } from '..';
import { Type, build as t, InferError } from '../type';
import { equalOrUnknown, getIdentifierString, getOfType } from '../utils';
import { inferExpression } from '.';
import { Context, pushStackAndPrevious } from './context';
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
    const columnNames: string[] = [];
    const columnTypes: Type[] = [];

    const addColumn = (name: string, type: Type) => {
      type = coerceIndices(type, indexName, tableLength);

      ctx.stack.set(name, type);

      columnTypes.push(type);
      columnNames.push(name);
    };

    for (const tableItem of table.args) {
      if (tableItem.type === 'table-column') {
        const [colDef, expr] = tableItem.args;
        const name = getIdentifierString(colDef);
        // eslint-disable-next-line no-await-in-loop
        const type = await inferExpression(ctx, expr);

        // Bail on error
        if (type.errorCause) {
          return type;
        }

        addColumn(name, type);
      } else if (tableItem.type === 'table-spread') {
        const ref = getOfType('ref', tableItem.args[0]);

        // eslint-disable-next-line no-await-in-loop
        const source = (await inferExpression(ctx, ref)).isTable();
        const { tableLength, columnNames, columnTypes } = source;

        if (source.errorCause) {
          return source;
        }

        for (const [name, type] of zip(
          getDefined(columnNames),
          getDefined(columnTypes)
        )) {
          addColumn(name, t.column(type, getDefined(tableLength), indexName));
        }
      }
    }

    if (columnTypes.length === 0) {
      return t.impossible(InferError.unexpectedEmptyTable());
    } else {
      const reduced = columnTypes.map((col) => col.reduced());

      return Type.combine(...reduced).mapType(() =>
        t.table({
          indexName,
          length: tableLength,
          columnTypes: reduced,
          columnNames,
        })
      );
    }
  });
};
