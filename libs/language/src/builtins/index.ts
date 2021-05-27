import { Type } from '../type';
import { getDefined, getInstanceof } from '../utils';
import { addTimeQuantity, sortSpecificities } from '../date';
import { AnyValue, Date, TimeQuantity } from '../interpreter/Value';

export interface BuiltinSpec {
  name: string;
  argCount: number;
  /** Each argument's cardinality (1 for scalar, 2 for array, 3 for array of array, etc). Defaults to [1] * argCount */
  argCardinalities?: number[];
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  fn?: (...args: any[]) => any;
  // Variant that operates on Value specifically
  fnValues?: (...args: AnyValue[]) => AnyValue;
  functor: (...types: Type[]) => Type;
}

const binopFunctor = (a: Type, b: Type) => a.isScalar('number').sameAs(b);

const dateCmpFunctor = (left: Type, right: Type): Type =>
  Type.combine(left.isDate(), right.sameAs(left), Type.Boolean);

const cmpFunctor = (left: Type, right: Type): Type =>
  Type.combine(
    left.isScalar('number').sameAs(right),
    Type.build({ type: 'boolean' })
  );

export const builtins: Record<string, BuiltinSpec> = {
  sqrt: {
    name: 'sqrt',
    argCount: 1,
    fn: (n) => Math.sqrt(n as number),
    functor: (n) => n.isScalar('number'),
  },
  ln: {
    name: 'ln',
    argCount: 1,
    fn: (n) => Math.log(n),
    functor: (n) => n.isScalar('number'),
  },
  '+': {
    name: '+',
    argCount: 2,
    fn: (a, b) => a + b,
    functor: binopFunctor,
  },
  '-': {
    name: '-',
    argCount: 2,
    fn: (a, b) => a - b,
    functor: binopFunctor,
  },
  '*': {
    name: '*',
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
    name: '/',
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
    name: '/',
    argCount: 2,
    fn: (a, b) => a % b,
    functor: binopFunctor,
  },
  '**': {
    name: '**',
    argCount: 2,
    fn: (a, b) => Math.pow(a, b),
    functor: binopFunctor,
  },
  '^': {
    name: '^',
    argCount: 2,
    fn: (a, b) => Math.pow(a, b),
    functor: binopFunctor,
  },
  '<': {
    name: '<',
    argCount: 2,
    fn: (a, b) => a < b,
    functor: cmpFunctor,
  },
  '>': {
    name: '>',
    argCount: 2,
    fn: (a, b) => a > b,
    functor: cmpFunctor,
  },
  '<=': {
    name: '<=',
    argCount: 2,
    fn: (a, b) => a <= b,
    functor: cmpFunctor,
  },
  '>=': {
    name: '>=',
    argCount: 2,
    fn: (a, b) => a >= b,
    functor: cmpFunctor,
  },
  '==': {
    name: '==',
    argCount: 2,
    fn: (a, b) => a == b,
    functor: cmpFunctor,
  },
  if: {
    name: 'if',
    argCount: 3,
    fn: (a, b, c) => (a ? b : c),
    functor: (a: Type, b: Type, c: Type) =>
      Type.combine(a.isScalar('boolean'), b.sameAs(c)),
  },
  // List stuff
  stepgrowth: {
    name: 'stepgrowth',
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
    name: 'grow',
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
      ).mapType(() =>
        Type.buildColumn(Type.Number, getDefined(period.columnSize))
      ),
  },
  transpose: {
    name: 'transpose',
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
      ).mapType((t) => {
        const horizontal = getDefined(t.columnSize);
        const vertical = getDefined(t.reduced().columnSize);

        return Type.buildColumn(
          Type.buildColumn(Type.Number, horizontal),
          vertical
        );
      }),
  },
  // Range stuff
  contains: {
    name: 'contains',
    argCount: 2,
    fn: ([bStart, bEnd], a) => a >= bStart && a <= bEnd,
    functor: (a: Type, b: Type) =>
      Type.combine(a.getRangeOf().sameAs(b), Type.Boolean),
  },
  containsdate: {
    name: 'containsdate',
    argCount: 2,
    fn: ([rStart, rEnd], [dStart, dEnd]) => rStart <= dStart && rEnd >= dEnd,
    functor: (a: Type, b: Type) =>
      Type.combine(a.getRangeOf().isDate(), b.isDate(), Type.Boolean),
  },
  // Date stuff (TODO operator overloading)
  dateequals: {
    name: 'dateequals',
    argCount: 2,
    fn: ([aStart, aEnd], [bStart, bEnd]) => aStart === bStart && aEnd === bEnd,
    functor: dateCmpFunctor,
  },
  dategte: {
    name: 'dategte',
    argCount: 2,
    fn: ([aStart], [bStart]) => aStart >= bStart,
    functor: dateCmpFunctor,
  },
  dateadd: {
    name: 'dateadd',
    argCount: 2,
    fnValues: (date: AnyValue, years: AnyValue) => {
      date = getInstanceof(date, Date);
      years = getInstanceof(years, TimeQuantity);

      const newDate = addTimeQuantity(
        date.timeRange.start.getData() as number,
        years.getData()
      );

      return Date.fromDateAndSpecificity(newDate, date.specificity);
    },
    functor: (date: Type, years: Type) =>
      Type.combine(date.isDate(), years.isTimeQuantity(), date).mapType(() => {
        const lowest = getDefined(
          sortSpecificities([
            getDefined(date.date),
            ...getDefined(years.timeUnits),
          ]).pop()
        );

        return Type.buildDate(lowest);
      }),
  },
  // Reduce funcs
  total: {
    name: 'total',
    argCount: 1,
    argCardinalities: [2],
    fn: (nums: number[]) => nums.reduce((a, b) => a + b),
    functor: (nums: Type) => nums.reduced(),
  },
};

export const hasBuiltin = (builtinName: string) =>
  Object.hasOwnProperty.call(builtins, builtinName);
