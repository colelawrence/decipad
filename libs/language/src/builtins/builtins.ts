import { produce } from 'immer';
import { dequal } from 'dequal';
import { singular } from 'pluralize';
import { Type, build as t } from '../type';
import { getDefined, getInstanceof, zip } from '../utils';
import {
  Value,
  AnyValue,
  fromJS,
  Scalar,
  Date,
  Column,
  TimeQuantity,
} from '../interpreter/Value';

import { overloadBuiltin } from './overloadBuiltin';
import { BuiltinSpec } from './interfaces';
import { dateOverloads } from './dateOverloads';
import { approximateSubsetSumIndices } from './table';
import { convertTimeQuantityTo, Time } from '../date';

const binopFunctor = (a: Type, b: Type) =>
  Type.combine(a.isScalar('number'), b.sameAs(a));

const removeUnit = produce((t: Type) => {
  if (t.type === 'number') t.unit = null;
});

const binopWithUnitlessSecondArgFunctor = (a: Type, b: Type) =>
  binopFunctor(a, removeUnit(b));

const dateCmpFunctor = (left: Type, right: Type): Type =>
  Type.combine(left.isDate(), right.sameAs(left), t.boolean());

const cmpFunctor = (left: Type, right: Type): Type =>
  Type.combine(left.isScalar('number'), right.sameAs(left), t.boolean());

const booleanBinopFunctor = (left: Type, right: Type): Type =>
  Type.combine(
    left.isScalar('boolean'),
    right.isScalar('boolean'),
    t.boolean()
  );

export const builtins: { [fname: string]: BuiltinSpec } = {
  abs: {
    argCount: 1,
    fn: (n) => Math.abs(n as number),
    functor: (n) => n.isScalar('number'),
  },
  round: {
    argCount: 2,
    fn: (n, decimalPrecision) => {
      const factor = 10 ** decimalPrecision;
      return Math.round(n * factor) / factor;
    },
    functor: (n: Type, decimalPrecision: Type) =>
      Type.combine(decimalPrecision.isScalar('number'), n.isScalar('number')),
  },
  sqrt: {
    argCount: 1,
    fn: (n) => Math.sqrt(n as number),
    functor: (n) => Type.combine(n.isScalar('number'), n.divideUnit(2)),
  },
  ln: {
    argCount: 1,
    fn: (n) => Math.log(n),
    functor: (n) => n.isScalar('number'),
  },
  '+': overloadBuiltin('+', 2, [
    {
      argTypes: ['number', 'number'],
      fnValues: (n1, n2) =>
        new Scalar(Number(n1.getData()) + Number(n2.getData())),
      functor: binopFunctor,
    },
    {
      argTypes: ['string', 'string'],
      fnValues: (n1, n2) =>
        new Scalar(String(n1.getData()) + String(n2.getData())),
      functor: (a, b) =>
        Type.combine(a.isScalar('string'), b.isScalar('string')),
    },
    ...dateOverloads['+'],
  ]),
  '-': overloadBuiltin('-', 2, [
    {
      argTypes: ['number', 'number'],
      fnValues: (a: AnyValue, b: AnyValue) =>
        fromJS((a.getData() as number) - (b.getData() as number)),
      functor: binopFunctor,
    },
    ...dateOverloads['-'],
  ]),
  'unary-': {
    argCount: 1,
    fn: (a) => -a,
    functor: (n) => n.isScalar('number'),
  },
  '*': {
    argCount: 2,
    fn: (a, b) => a * b,
    functor: (a, b) =>
      Type.combine(
        a.isScalar('number'),
        b.isScalar('number'),
        a.multiplyUnit(b.unit)
      ),
  },
  '/': {
    argCount: 2,
    fn: (a, b) => a / b,
    functor: (a, b) =>
      Type.combine(
        a.isScalar('number'),
        b.isScalar('number'),
        a.divideUnit(b.unit)
      ),
  },
  '%': {
    argCount: 2,
    fn: (a, b) => a % b,
    functor: binopFunctor,
  },
  '**': {
    argCount: 2,
    fn: (a, b) => a ** b,
    functor: binopWithUnitlessSecondArgFunctor,
  },
  '^': {
    argCount: 2,
    fn: (a, b) => a ** b,
    functor: binopWithUnitlessSecondArgFunctor,
  },
  '<': {
    argCount: 2,
    fn: (a, b) => a < b,
    functor: cmpFunctor,
  },
  '>': {
    argCount: 2,
    fn: (a, b) => a > b,
    functor: cmpFunctor,
  },
  '<=': {
    argCount: 2,
    fn: (a, b) => a <= b,
    functor: cmpFunctor,
  },
  '>=': {
    argCount: 2,
    fn: (a, b) => a >= b,
    functor: cmpFunctor,
  },
  '==': {
    argCount: 2,
    fn: (a, b) => a === b,
    functor: cmpFunctor,
  },
  '!=': {
    argCount: 2,
    fn: (a, b) => a !== b,
    functor: cmpFunctor,
  },
  // Boolean ops
  '!': {
    argCount: 1,
    fn: (a) => !a,
    functor: (a) => a.isScalar('boolean'),
  },
  not: {
    aliasFor: '!',
  },
  '&&': {
    argCount: 2,
    fn: (a, b) => a && b,
    functor: booleanBinopFunctor,
  },
  and: {
    aliasFor: '&&',
  },
  '||': {
    argCount: 2,
    fn: (a, b) => a || b,
    functor: booleanBinopFunctor,
  },
  or: {
    aliasFor: '||',
  },
  if: {
    argCount: 3,
    fn: (a, b, c) => (a ? b : c),
    functor: (a: Type, b: Type, c: Type) =>
      Type.combine(a.isScalar('boolean'), c.sameAs(b)),
  },
  // List stuff
  len: {
    argCount: 1,
    fnValuesNoAutomap: (a: Value[]) => {
      const v = a[0];
      if (v instanceof Column) {
        return fromJS(v.rowCount);
      }
      return fromJS(1);
    },
    functor: () => t.number(),
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
    functorNoAutomap: (a: Type, b: Type) =>
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
    fnValuesNoAutomap: (args: Value[]) => {
      const [a] = args;
      const aData = a.getData();
      const aElements = Array.isArray(aData) ? aData : [aData];
      return fromJS(aElements[0]);
    },
    functorNoAutomap: (a: Type) => Type.combine(a.reducedOrSelf()),
  },
  last: {
    argCount: 1,
    fnValuesNoAutomap: (args: Value[]) => {
      const [a] = args;
      const aData = a.getData();
      const aElements = Array.isArray(aData) ? aData : [aData];
      return fromJS(aElements[aElements.length - 1]);
    },
    functorNoAutomap: (a: Type) => Type.combine(a.reducedOrSelf()),
  },
  stepgrowth: {
    argCount: 1,
    argCardinalities: [2],
    fn: (a: number[]) =>
      a.map((item, index) => {
        const previous = a[index - 1] ?? 0;
        return item - previous;
      }),
    functor: (a: Type) =>
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
    functor: (initial: Type, growthRate: Type, period: Type) =>
      Type.combine(
        initial.isScalar('number'),
        growthRate.isScalar('number'),
        period.isColumn()
      ).mapType(() => t.column(t.number(), getDefined(period.columnSize))),
  },
  transpose: {
    argCount: 1,
    argCardinalities: [3],
    fn: (twoDee: number[][]) =>
      Array.from({ length: twoDee[0].length }, (_, y) =>
        Array.from({ length: twoDee.length }, (_, x) =>
          getDefined(twoDee[x][y])
        )
      ),
    functor: (twoDee: Type) =>
      Type.combine(
        twoDee.isColumn().reduced().isColumn().reduced().isScalar('number'),
        twoDee
      ).mapType((matrix) => {
        const horizontal = getDefined(matrix.columnSize);
        const vertical = getDefined(matrix.reduced().columnSize);

        return t.column(t.column(t.number(), horizontal), vertical);
      }),
  },
  // Table stuff
  approximateSubsetSum: {
    argCount: 3,
    argCardinalities: [1, 3, 1],
    fnValues: (upperBound, table, columnName) => {
      const tableColumn = getInstanceof(table, Column);
      const valueNames = getDefined(tableColumn.valueNames);
      const columnIndex = valueNames.indexOf(columnName.getData() as string);
      if (columnIndex < 0) {
        throw new Error(`Column ${columnName} does not exist`);
      }

      const indices = approximateSubsetSumIndices(
        upperBound.getData() as number,
        table.getData() as unknown[][],
        columnIndex
      );

      return Column.fromNamedValues(
        tableColumn.values.map((column) =>
          Column.fromValues(
            getInstanceof(column, Column).values.filter((_, i) =>
              indices.includes(i)
            )
          )
        ),
        getDefined(valueNames)
      );
    },
    functor: (upperBound, table, columnName) =>
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
  concatenate: {
    argCount: 2,
    argCardinalities: [3, 3],
    fnValues: (tab1, tab2) => {
      const { values: columns1, valueNames } = getInstanceof(tab1, Column);
      const { values: columns2 } = getInstanceof(tab2, Column);

      return Column.fromNamedValues(
        zip(columns1 as Column[], columns2 as Column[]).map(([c1, c2]) =>
          Column.fromValues([...c1.values, ...c2.values])
        ),
        getDefined(valueNames)
      );
    },
    functor: (tab1, tab2) =>
      Type.combine(tab1.isTable(), tab2.isTable()).mapType(() => {
        if (
          !dequal(tab1.columnNames, tab2.columnNames) ||
          !dequal(tab1.columnTypes, tab2.columnTypes)
        ) {
          return t.impossible('Incompatible tables');
        } else {
          return produce(tab1, (tab1) => {
            if (
              typeof tab1.tableLength === 'number' &&
              typeof tab2.tableLength === 'number'
            ) {
              tab1.tableLength += tab2.tableLength;
            } else {
              tab1.tableLength = 'unknown';
            }
          });
        }
      }),
  },
  // Range stuff
  contains: overloadBuiltin('contains', 2, [
    {
      argTypes: ['number', 'number'],
      fnValues: (a, b) => {
        const [aStart, aEnd] = a.getData() as number[];
        const bNumber = b.getData() as number;
        return fromJS(bNumber >= aStart && bNumber <= aEnd);
      },
      functor: (a: Type, b: Type): Type =>
        Type.combine(
          a.isRange(),
          b.isScalar('number').noUnitsOrSameUnitsAs(a.getRangeOf()),
          t.boolean()
        ),
    },
    {
      argTypes: ['date', 'date'],
      fnValues: (a, b) => {
        const aVal = getInstanceof(a, Date);
        const bVal = getInstanceof(b, Date);
        return fromJS(
          aVal.getData() <= bVal.getData() && aVal.getEnd() >= bVal.getEnd()
        );
      },
      functor: (a: Type, b: Type) =>
        Type.combine(a.isDate(), b.isDate(), t.boolean()),
    },
  ]),
  containsdate: {
    argCount: 2,
    fnValues: (range, date) => {
      const [rStart, rEnd] = range.getData() as number[];
      const dateVal = getInstanceof(date, Date);
      return fromJS(rStart <= dateVal.getData() && rEnd >= dateVal.getEnd());
    },
    functor: (a: Type, b: Type) =>
      Type.combine(a.getRangeOf().isDate(), b.isDate(), t.boolean()),
  },
  // Date stuff (TODO operator overloading)
  dateequals: {
    argCount: 2,
    fn: (date1, date2) => date1 === date2,
    functor: dateCmpFunctor,
  },
  dategte: {
    argCount: 2,
    fn: (date1, date2) => date1 >= date2,
    functor: dateCmpFunctor,
  },
  in: overloadBuiltin('in', 2, [
    {
      argTypes: ['time-quantity', 'string'],
      fnValues: (timeQuantity, unit) => {
        return fromJS(
          convertTimeQuantityTo(
            timeQuantity as TimeQuantity,
            singular(unit.getData() as string) as Time.Unit
          )
        );
      },
      functor: (a: Type, b: Type) =>
        Type.combine(a.isTimeQuantity(), b.isScalar('string')).mapType(
          () => t.number() // TODO: number should have same units as b string runtime value..
        ),
    },
  ]),
  // Reduce funcs
  total: {
    argCount: 1,
    argCardinalities: [2],
    fn: (nums: number[]) => nums.reduce((a, b) => a + b, 0),
    functor: (nums: Type) => nums.reduced().isScalar('number'),
  },
};
