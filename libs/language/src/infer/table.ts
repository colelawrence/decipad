import { getDefined, zip } from '@decipad/utils';

import type { AST } from '..';
import { Type, build as t } from '../type';
import { getIdentifierString, getOfType } from '../utils';
import { inferExpression } from '.';
import { Context, pushStackAndPrevious } from './context';

const getLargestColumn = (columnTypes: Type[]) => {
  const columnSizes = new Set([...columnTypes].map((c) => c.columnSize));
  columnSizes.delete(null);
  columnSizes.delete('unknown');
  return Array.from(columnSizes)[0];
};

export const unifyColumnSizes = (
  indexName: string | null,
  types: Type[],
  columnNames: string[]
): Type => {
  const length = getLargestColumn(types) ?? 1;
  const columnTypes = types.map((colValue) => {
    if (colValue.columnSize === length || colValue.columnSize === 'unknown') {
      return colValue.reduced();
    } else {
      return t.impossible('Incompatible column sizes');
    }
  });

  return t.table({ indexName, length, columnTypes, columnNames });
};

export const inferTable = (ctx: Context, expr: AST.Table) => {
  let tableLength: number | 'unknown' = 'unknown';
  return pushStackAndPrevious(ctx, async () => {
    const columnNames: string[] = [];
    const columnTypes: Type[] = [];
    let indexName = ctx.inAssignment;

    const addColumn = (name: string, type: Type) => {
      if (type.columnSize == null) {
        // Because we're so very nice, allow `Column = 1` as syntax sugar.
        type = t.column(type, tableLength);
      } else if (tableLength === 'unknown') {
        tableLength = type.columnSize;
      }

      ctx.stack.set(name, type);

      columnTypes.push(type);
      columnNames.push(name);
    };

    for (const tableItem of expr.args) {
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
        [indexName] = ref.args;

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
          addColumn(name, t.column(type, getDefined(tableLength)));
        }
      }
    }

    return unifyColumnSizes(indexName, columnTypes, columnNames);
  });
};
