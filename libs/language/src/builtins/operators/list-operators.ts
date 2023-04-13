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
  sort,
  unique,
  reverse,
} from '../../value';
import { SwappedDimensions, ConcatenatedColumn } from '../../lazy';
import { Type, buildType as t } from '../../type';
import { getInstanceof } from '../../utils';
import { BuiltinSpec } from '../interfaces';
import { approximateSubsetSumIndices } from '../table';
import {
  chooseFirst,
  deLinearizeType,
  linearizeType,
} from '../../dimtools/common';

export const listOperators: Record<string, BuiltinSpec> = {
  len: {
    argCount: 1,
    isReducer: true,
    noAutoconvert: true,
    argCardinalities: [2],
    fnValues: ([col]: Value[]) => fromJS(getColumnLike(col).rowCount),
    functionSignature: 'column<A> -> number',
    explanation: 'Size of a column.',
    syntax: 'len(Table.Column)',
    example: 'len(Sales.Entries)',
    formulaGroup: 'Columns',
  },
  cat: {
    argCount: 2,
    argCardinalities: [2, 2],
    // TODO: make this a varargs function
    fnValues: ([a, b]: Value[]) =>
      new ConcatenatedColumn(getColumnLike(a), getColumnLike(b)),
    functionSignature: 'column<A>, column<A> -> column<A>',
    explanation: 'Joins two tables or columns into one.',
    syntax: 'cat(Table1.Col1, Table2.Col2)',
    example: 'cat(Day1.Sales, Day2.Sales)',
    formulaGroup: 'Tables or Columns',
  },
  first: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fnValues: ([arg]: Value[]) =>
      getDefined(getColumnLike(arg).atIndex(0), 'could not find first element'),
    functionSignature: 'column<A> -> A',
    explanation: 'First element of a column.',
    example: 'first(Table.Column)',
    syntax: 'first(Flights.Seats)',
    formulaGroup: 'Columns',
  },
  last: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fnValues: ([arg]: Value[]) => {
      const col = getColumnLike(arg);
      return getDefined(
        col.atIndex(col.rowCount - 1),
        'could not find last element'
      );
    },
    functionSignature: 'column<A> -> A',
    explanation: 'Last element of a column.',
    example: 'last(Table.Column)',
    syntax: 'last(Flights.Seats)',
    formulaGroup: 'Columns',
  },
  count: {
    aliasFor: 'len',
    explanation: 'Size of a column.',
    syntax: 'count(Table.Column)',
    example: 'count(Sales.Entries)',
    formulaGroup: 'Columns',
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
    explanation: 'Number of entries on a column that match a condition.',
    example: 'countif(Table.Column > 100)',
    syntax: 'countif(Flights.Passengers > 100)',
    formulaGroup: 'Columns',
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
    explanation: 'Increments between values in a column.',
    syntax: 'stepgrowth(Table.Column)',
    example: 'stepgrowth(SalaryYears.Amount)',
    formulaGroup: 'Columns',
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
      ).mapType(() => t.column(initial, period.indexedBy)),
    explanation: 'Compounds a value by a specific rate.',
    syntax: 'grow(Initial, Rate, Table.Column)',
    example: 'grow($10k, 5%, Investment.Years)',
    formulaGroup: 'Columns',
  },
  transpose: {
    argCount: 1,
    argCardinalities: [3],
    fnValues: ([matrix]) => new SwappedDimensions(getColumnLike(matrix), 1),
    functor: ([matrix]) =>
      Type.combine(matrix.isColumn().reduced().isColumn().reduced()).mapType(
        () => {
          const linear = linearizeType(matrix);
          const secondDimensionFirst = chooseFirst(1, linear);

          return deLinearizeType(secondDimensionFirst);
        }
      ),
    explanation: 'Matrix',
    syntax: 'transpose(Matrix)',
    example: 'transpose(Years)',
    formulaGroup: 'Algebra',
    hidden: true,
  },

  sort: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: ([column]) => sort(getColumnLike(column)),
    functionSignature: 'column<A>:R -> R',
    explanation: 'Sorts a column.',
    syntax: 'sort(Table.Column)',
    example: 'sort(Flight.Prices)',
    formulaGroup: 'Columns',
  },

  unique: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: ([column]) => unique(getColumnLike(column)),
    functionSignature: 'column<A> -> column<A>',
    explanation: 'Extracts the unique values of a column.',
    syntax: 'unique(Table.Column)',
    example: 'unique(Sales.ClientsID)',
    formulaGroup: 'Columns',
  },

  reverse: {
    argCount: 1,
    functorNoAutomap: ([column]) =>
      Type.either(column.isColumn(), column.isTable()),
    fnValuesNoAutomap: ([column]) => {
      if (column instanceof Table) {
        return column.mapColumns((column) => reverse(column));
      } else {
        return reverse(getColumnLike(column));
      }
    },
    explanation: 'Reverses the order of a column or table.',
    syntax: 'reverse(Table)\nreverse(Table.Column)',
    example: 'reverse(Purchases)\nreverse(Purchases.Dates)',
    formulaGroup: 'Tables or Columns',
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
    hidden: true,
  },
};
