import DeciNumber from '@decipad/number';
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
    explanation:
      'Counts the number of entries on a list or column\n\nExample: `len(Table.Column)`',
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
    explanation:
      'Joins two lists or columns into one.\n\nExample:`cat(List1, Table.Column)`',
  },
  first: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fnValues: ([arg]: Value[]) => getColumnLike(arg).atIndex(0),
    functionSignature: 'column<A> -> A',
    explanation:
      'Grabs the first element of a list or column.\n\nExample: `first(Table.Column)```',
  },
  last: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fnValues: ([arg]: Value[]) => {
      const col = getColumnLike(arg);
      return col.atIndex(col.rowCount - 1);
    },
    functionSignature: 'column<A> -> A',
    explanation:
      'Grabs the last element of a list or column.\n\nExample: `last(Table.Column)`',
  },
  count: {
    aliasFor: 'len',
  },
  countif: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fnValues: ([a]: Value[]) => {
      const aData = getColumnLike(a).getData() as OneResult[];
      return fromJS(
        aData.reduce((count, elem) => (elem.valueOf() ? count + 1 : count), 0)
      );
    },
    functionSignature: 'column<boolean> -> number',
    explanation:
      'Counts the number of entries on a list or column that respect a certain condition.\n\nExample: `countif(Flights.PassengerCount > 100)`',
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
    explanation:
      'This formula gives you the increments (or decrements) between values in a list os column.\n\nExample: `stepgrowth(Table.Column)`',
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
    explanation:
      'Compounds an initial value by a specific rate over a list or column.\n\nExample: `grow(30, 5%, Table.Column)`',
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
    explanation: 'Sorts a list or column.\n\nExample: `sort(Table.Column)`',
  },

  unique: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: ([column]) => ValueTransforms.unique(getColumnLike(column)),
    functionSignature: 'column<A> -> column<A>',
    explanation:
      'Gives you the unique values of a list or column.\n\nExample: `unique(Table.Column)`',
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
    explanation:
      'Reverses the order of a list or table.\n\nSyntax: `reverse(Table)` or `reverse(Table.Column)`',
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
        upperBound.getData() as DeciNumber,
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
          columnNames: getDefined(table.columnNames),
          columnTypes: getDefined(table.columnTypes),
        })
      ),
  },
};
