import Fraction from '@decipad/fraction';
import { getDefined } from '@decipad/utils';
import { RuntimeError } from '../../interpreter';
import { OneResult } from '../../interpreter/interpreter-types';
import {
  Value,
  Column,
  Table,
  fromJS,
  getColumnLike,
  ValueTransforms,
} from '../../value';
import { SwappedHypercube, ConcatenatedColumn } from '../../lazy';
import { Type, build as t } from '../../type';
import { getInstanceof } from '../../utils';
import { BuiltinSpec } from '../interfaces';
import { approximateSubsetSumIndices } from '../table';

export const listOperators: Record<string, BuiltinSpec> = {
  len: {
    argCount: 1,
    isReducer: true,
    noAutoconvert: true,
    argCardinalities: [2],
    fnValues: ([col]: Value[]) => fromJS(getColumnLike(col).rowCount),
    functionSignature: 'column<A> -> number',
  },
  cat: {
    argCount: 2,
    argCardinalities: [2, 2],
    // TODO: make this a varargs function
    fnValues: ([a, b]: Value[]) =>
      new ConcatenatedColumn(getColumnLike(a), getColumnLike(b)),
    functor: ([a, b]) =>
      Type.combine(a.reduced().sameAs(b.reduced())).mapType(() => {
        const resultColumnSize =
          a.columnSize === 'unknown' || b.columnSize === 'unknown'
            ? 'unknown'
            : (a.columnSize || 1) + (b.columnSize || 1);
        return t.column(a.reduced(), resultColumnSize);
      }),
  },
  first: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: ([arg]: Value[]) => getColumnLike(arg).atIndex(0),
    functionSignature: 'column<A> -> A',
  },
  last: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: ([arg]: Value[]) => {
      const col = getColumnLike(arg);
      return col.atIndex(col.rowCount - 1);
    },
    functionSignature: 'column<A> -> A',
  },
  count: {
    aliasFor: 'len',
  },
  countif: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: ([a]: Value[]) => {
      const aData = getColumnLike(a).getData() as OneResult[];
      return fromJS(
        aData.reduce((count, elem) => (elem.valueOf() ? count + 1 : count), 0)
      );
    },
    functionSignature: 'column<boolean> -> number',
  },
  stepgrowth: {
    argCount: 1,
    argCardinalities: [2],
    fn: ([a]: number[][]) =>
      a.map((item, index) => {
        const previous = a[index - 1] ?? 0;
        return item - previous;
      }),
    functionSignature: 'column<number>:A -> A',
  },
  grow: {
    argCount: 3,
    argCardinalities: [1, 1, 2],
    fn: ([initial, growthRate, { length }]) =>
      Array.from({ length }, (_, i) => {
        const growth = (1 + growthRate) ** i;
        return initial * growth;
      }),
    functor: ([initial, growthRate, period]) =>
      Type.combine(
        initial.isScalar('number'),
        growthRate.isScalar('number'),
        period.isColumn()
      ).mapType(() => t.column(initial, getDefined(period.columnSize))),
  },
  transpose: {
    argCount: 1,
    argCardinalities: [3],
    fnValues: ([matrix]) => new SwappedHypercube(getColumnLike(matrix), 1),
    functor: ([matrix]) =>
      Type.combine(matrix.isColumn().reduced().isColumn().reduced()).mapType(
        (cell) => {
          const horizontal = getDefined(matrix.columnSize);
          const vertical = getDefined(matrix.reduced().columnSize);

          return t.column(t.column(cell, horizontal), vertical);
        }
      ),
  },

  sort: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: ([column]) => ValueTransforms.sort(getColumnLike(column)),
    functionSignature: 'column<A>:R -> R',
  },

  unique: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: ([column]) => ValueTransforms.unique(getColumnLike(column)),
    functionSignature: 'column<A> -> column<A>',
  },

  reverse: {
    argCount: 1,
    functorNoAutomap: ([column]) =>
      Type.either(column.isColumn(), column.isTable()),
    fnValuesNoAutomap: ([column]) => {
      if (column instanceof Table) {
        return column.mapColumns((column) => ValueTransforms.reverse(column));
      } else {
        return ValueTransforms.reverse(getColumnLike(column));
      }
    },
  },

  // Table stuff
  approximatesubsetsum: {
    argCount: 3,
    fnValues: ([upperBound, _table, columnName]) => {
      const table = getInstanceof(_table, Table);
      const { columnNames } = table;
      const columnIndex = columnNames.indexOf(columnName.getData() as string);
      if (columnIndex < 0) {
        throw new RuntimeError(`Column ${columnName} does not exist`);
      }

      const indices = approximateSubsetSumIndices(
        upperBound.getData() as Fraction,
        table.getData() as unknown[][],
        columnIndex
      );

      return table.mapColumns((column) =>
        Column.fromValues(
          column.values.filter((_, i) => indices.includes(i)),
          []
        )
      );
    },
    functor: ([upperBound, table, columnName]) =>
      Type.combine(
        upperBound.isScalar('number'),
        table.isTable(),
        columnName.isScalar('string')
      ).mapType(() =>
        t.table({
          length: 'unknown',
          columnNames: getDefined(table.columnNames),
          columnTypes: getDefined(table.columnTypes),
        })
      ),
  },
};
