import { getDefined } from '@decipad/utils';
import { map } from '@decipad/generator-utils';
import DeciNumber, { N, ONE, ZERO } from '@decipad/number';
import {
  Value,
  Table,
  fromJS,
  getColumnLike,
  sort,
  unique,
  reverse,
  Column,
  Scalar,
  defaultValue,
} from '../../value';
import { createConcatenatedColumn, createSwappedDimensions } from '../../lazy';
import { Type, buildType as t } from '../../type';
import { BuiltinSpec } from '../interfaces';
import {
  chooseFirst,
  deLinearizeType,
  linearizeType,
} from '../../dimtools/common';
import { getInstanceof } from '../../utils';

export const listOperators: Record<string, BuiltinSpec> = {
  len: {
    argCount: 1,
    isReducer: true,
    noAutoconvert: true,
    argCardinalities: [2],
    fnValues: async ([col]: Value[], [type]: Type[] = []) =>
      fromJS(await getColumnLike(col).rowCount(), defaultValue(type)),
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
    fnValues: async ([a, b]: Value[]) =>
      createConcatenatedColumn(getColumnLike(a), getColumnLike(b)),
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
    fnValues: async ([arg]: Value[]) =>
      getDefined(
        await getColumnLike(arg).atIndex(0),
        'could not find first element'
      ),
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
    fnValues: async ([arg]: Value[]) => {
      const col = getColumnLike(arg);
      return getDefined(
        await col.atIndex((await col.rowCount()) - 1),
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
    fnValues: async ([a]: Value[]) => {
      let count = 0;
      for await (const elem of getColumnLike(a).values()) {
        if (await elem.getData()) {
          count += 1;
        }
      }
      return fromJS(count, defaultValue({ kind: 'number' }));
    },
    functionSignature: 'column<boolean> -> number',
    explanation: 'Number of entries on a column that match a condition.',
    example: 'countif(Flights.Passengers > 100)',
    syntax: 'countif(Table.Column > 100)',
    formulaGroup: 'Columns',
  },
  stepgrowth: {
    argCount: 1,
    argCardinalities: [2],
    noAutoconvert: true,
    fnValues: ([a]) =>
      Column.fromGenerator(() => {
        let previous = ZERO;
        return map(getColumnLike(a).values(), async (item) => {
          const current = getInstanceof(await item.getData(), DeciNumber);
          const next = current.sub(previous);
          previous = current;
          return Scalar.fromValue(next);
        });
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
    noAutoconvert: true,
    fnValues: async ([_initial, _growthRate, it]) => {
      const initial = getInstanceof(await _initial.getData(), DeciNumber);
      const growthRate = getInstanceof(
        await _growthRate.getData(),
        DeciNumber
      ).add(ONE);
      return Column.fromGenerator(() =>
        map(getColumnLike(it).values(), (_v, i) => {
          const growth = growthRate.pow(N(i));
          const grown = initial.mul(growth);
          return Scalar.fromValue(grown);
        })
      );
    },
    functor: async ([initial, growthRate, period]) =>
      (
        await Type.combine(
          initial.isScalar('number'),
          growthRate.isScalar('number'),
          period.isColumn()
        )
      ).mapType(() => t.column(initial, period.indexedBy)),
    explanation: 'Compounds a value by a specific rate.',
    syntax: 'grow(Initial, Rate, Table.Column)',
    example: 'grow($10k, 5%, Investment.Years)',
    formulaGroup: 'Columns',
  },
  transpose: {
    argCount: 1,
    argCardinalities: [3],
    fnValues: async ([matrix]) =>
      createSwappedDimensions(getColumnLike(matrix), 1),
    functor: async ([matrix]) =>
      (
        await Type.combine(
          (
            await (await (await matrix.isColumn()).reduced()).isColumn()
          ).reduced()
        )
      ).mapType(async () => {
        const linear = linearizeType(matrix);
        const secondDimensionFirst = chooseFirst(1, linear);

        return deLinearizeType(secondDimensionFirst);
      }),
    explanation: 'Matrix',
    syntax: 'transpose(Matrix)',
    example: 'transpose(Years)',
    formulaGroup: 'Algebra',
    hidden: true,
  },

  sort: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: async ([column]) => sort(getColumnLike(column)),
    functionSignature: 'column<A>:R -> R',
    explanation: 'Sorts a column.',
    syntax: 'sort(Table.Column)',
    example: 'sort(Flight.Prices)',
    formulaGroup: 'Columns',
  },

  unique: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: async ([column]) => unique(getColumnLike(column)),
    functionSignature: 'column<A> -> column<A>',
    explanation: 'Extracts the unique values of a column.',
    syntax: 'unique(Table.Column)',
    example: 'unique(Sales.ClientsID)',
    formulaGroup: 'Columns',
  },

  reverse: {
    argCount: 1,
    functorNoAutomap: async ([columnOrTable]) =>
      Type.either(columnOrTable.isColumn(), columnOrTable.isTable()),
    fnValuesNoAutomap: async ([columnOrTable]) => {
      if (columnOrTable instanceof Table) {
        return columnOrTable.mapColumns(async (column) => reverse(column));
      } else {
        return reverse(getColumnLike(columnOrTable));
      }
    },
    explanation: 'Reverses the order of a column or table.',
    syntax: 'reverse(Table)\nreverse(Table.Column)',
    example: 'reverse(Purchases)\nreverse(Purchases.Dates)',
    formulaGroup: 'Tables or Columns',
  },
};
