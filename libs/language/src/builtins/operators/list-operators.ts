import Fraction from '@decipad/fraction';
import { getDefined } from '@decipad/utils';
import produce from 'immer';
import { RuntimeError } from '../../interpreter';
import { Value, Column, Table, fromJS } from '../../interpreter/Value';
import { Type, build as t } from '../../type';
import { getInstanceof } from '../../utils';
import { BuiltinSpec } from '../interfaces';
import { approximateSubsetSumIndices } from '../table';

export const listOperators: Record<string, BuiltinSpec> = {
  len: {
    argCount: 1,
    noAutoconvert: true,
    fnValuesNoAutomap: (a: Value[]) => {
      const v = a[0];
      if (v instanceof Column) {
        return fromJS(v.rowCount);
      }
      return fromJS(1);
    },
    functorNoAutomap: () => t.number(),
  },
  cat: {
    argCount: 2,
    // TODO: make this a varargs function
    fnValuesNoAutomap: (args: Value[]) => {
      const [a, b] = args;
      const aData = a.getData();
      const aElements = Array.isArray(aData) ? aData : [aData];
      const bData = b.getData();
      const bElements = Array.isArray(bData) ? bData : [bData];
      return fromJS(aElements.concat(bElements));
    },
    functorNoAutomap: ([a, b]) =>
      Type.combine(a.reducedOrSelf().sameAs(b.reducedOrSelf())).mapType(() => {
        const resultColumnSize =
          a.columnSize === 'unknown' || b.columnSize === 'unknown'
            ? 'unknown'
            : (a.columnSize || 1) + (b.columnSize || 1);
        return t.column(a.reducedOrSelf(), resultColumnSize);
      }),
  },
  first: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: (args: Value[]) => {
      const [a] = args;
      const aData = a.getData();
      const aElements = Array.isArray(aData) ? aData : [aData];
      return fromJS(aElements[0]);
    },
    functor: ([a]) => Type.combine(a.reducedOrSelf()),
  },
  last: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: (args: Value[]) => {
      const [a] = args;
      const aData = a.getData();
      const aElements = Array.isArray(aData) ? aData : [aData];
      return fromJS(aElements[aElements.length - 1]);
    },
    functor: ([a]) => Type.combine(a.reducedOrSelf()),
  },
  count: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: ([a]: Value[]) => {
      const aData = a.getData();
      return fromJS(Array.isArray(aData) ? aData.length : 1);
    },
    functor: () => t.number(),
  },
  countif: {
    argCount: 1,
    argCardinalities: [2],
    fnValues: (args: Value[]) => {
      const [a] = args;
      const aData = a.getData();
      const aElements = Array.isArray(aData) ? aData : [aData];
      return fromJS(
        aElements.reduce<number>(
          (count, elem) => (elem.valueOf() ? count + 1 : count),
          0
        )
      );
    },
    functor: ([a]) =>
      Type.combine(a.reducedOrSelf().isScalar('boolean'), t.number()),
  },
  stepgrowth: {
    argCount: 1,
    argCardinalities: [2],
    fn: (a: number[]) =>
      a.map((item, index) => {
        const previous = a[index - 1] ?? 0;
        return item - previous;
      }),
    functor: ([a]) =>
      Type.combine(a.isColumn().reduced().isScalar('number'), a),
  },
  grow: {
    argCount: 3,
    argCardinalities: [1, 1, 2],
    fn: (initial: number, growthRate: number, { length }: unknown[]) =>
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
    fnValues: ([_matrix]) => {
      const matrix = getInstanceof(_matrix, Column);
      const matrixWidth = matrix.rowCount;
      const matrixHeight = getInstanceof(matrix.values[0], Column).rowCount;

      return Column.fromValues(
        Array.from({ length: matrixHeight }, (_, y) =>
          Column.fromValues(
            Array.from({ length: matrixWidth }, (_, x) =>
              getDefined((matrix.values[x] as Column).values[y])
            )
          )
        )
      );
    },
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
    functorNoAutomap: ([column]) => column.isColumn(),
    fnValuesNoAutomap: ([_column]) => {
      const column = getInstanceof(_column, Column);
      return column.sort();
    },
  },

  unique: {
    argCount: 1,
    functorNoAutomap: ([column]) =>
      Type.combine(column.isColumn(), (column) =>
        produce(column, (column) => {
          column.columnSize = 'unknown';
        })
      ),
    fnValuesNoAutomap: ([_column]) => {
      const column = getInstanceof(_column, Column);
      return column.unique();
    },
  },

  reverse: {
    argCount: 1,
    functorNoAutomap: ([column]) =>
      Type.either(column.isColumn(), column.isTable()),
    fnValuesNoAutomap: ([column]) => {
      if (column instanceof Table) {
        return column.mapColumns((column) => column.reverse());
      }
      return getInstanceof(column, Column).reverse();
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
        Column.fromValues(column.values.filter((_, i) => indices.includes(i)))
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
