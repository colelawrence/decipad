import { Type } from '../type';
import { getDefined, getInstanceof } from '../utils';
import { dateToArray, arrayToDate } from '../date';
import { AnyValue, Date } from '../interpreter/Value';

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

const binopFunctor = (...types: Type[]) =>
  types.reduce((a, b) => a.isScalar('number').sameAs(b).withUnit(b.unit));

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
    functor: binopFunctor,
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
    functor: (a, b) => a.isScalar('number').sameAs(b).multiplyUnit(b.unit),
  },
  '/': {
    name: '/',
    argCount: 2,
    fn: (a, b) => a / b,
    functor: (a, b) => a.isScalar('number').sameAs(b).divideUnit(b.unit),
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
    fn: (initial: number, growthRate: number, length: unknown[]) => {
      let current = initial;
      return Array.from({ length: length.length }, (_) => {
        const ret = current;
        current += current * growthRate;
        return ret;
      });
    },
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
      Type.combine(
        a.isRange(),
        b.isScalar('number'),
        a.withUnit(b.unit),
        Type.Boolean
      ),
  },
  containsdate: {
    name: 'containsdate',
    argCount: 2,
    fn: ([rStart, rEnd], [dStart, dEnd]) => rStart <= dStart && rEnd >= dEnd,
    functor: (a: Type, b: Type) =>
      Type.combine(a.isRange().isDate(), b.isDate(), Type.Boolean),
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
  dateaddyears: {
    name: 'dateaddyears',
    argCount: 2,
    fnValues: (date: AnyValue, years: AnyValue) => {
      date = getInstanceof(date, Date);

      const asArray = dateToArray(date.timeRange.start.getData() as number);

      asArray[0] += years.getData() as number;

      const [newDate] = arrayToDate(asArray);

      return Date.fromDateAndSpecificity(newDate, date.specificity);
    },
    functor: (date: Type, years: Type) =>
      Type.combine(date.isDate(), years.isScalar('number'), date),
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
