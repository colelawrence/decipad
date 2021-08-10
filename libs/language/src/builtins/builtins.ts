import { produce } from 'immer';
import { Type, build as t } from '../type';
import { getDefined } from '../utils';
import { Scalar } from '../interpreter/Value';

import { overloadBuiltin } from './overloadBuiltin';
import { BuiltinSpec } from './interfaces';

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
  sqrt: {
    argCount: 1,
    fn: (n) => Math.sqrt(n as number),
    functor: (n) => n.isScalar('number'),
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
  ]),
  '-': {
    argCount: 2,
    fn: (a, b) => a - b,
    functor: binopFunctor,
  },
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
    fn: (a, b) => Math.pow(a, b),
    functor: binopWithUnitlessSecondArgFunctor,
  },
  '^': {
    argCount: 2,
    fn: (a, b) => Math.pow(a, b),
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
    fn: (a, b) => a == b,
    functor: cmpFunctor,
  },
  '!=': {
    argCount: 2,
    fn: (a, b) => a != b,
    functor: cmpFunctor,
  },
  // Boolean ops
  '!': {
    argCount: 1,
    fn: (a) => !a,
    functor: (a) => a.isScalar('boolean'),
  },
  '&&': {
    argCount: 2,
    fn: (a, b) => a && b,
    functor: booleanBinopFunctor,
  },
  '||': {
    argCount: 2,
    fn: (a, b) => a || b,
    functor: booleanBinopFunctor,
  },
  if: {
    argCount: 3,
    fn: (a, b, c) => (a ? b : c),
    functor: (a: Type, b: Type, c: Type) =>
      Type.combine(a.isScalar('boolean'), c.sameAs(b)),
  },
  // List stuff
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
  // Range stuff
  contains: {
    argCount: 2,
    fn: ([bStart, bEnd], a) => a >= bStart && a <= bEnd,
    functor: (a: Type, b: Type) =>
      Type.combine(b.sameAs(a.getRangeOf()), t.boolean()),
  },
  containsdate: {
    argCount: 2,
    fn: ([rStart, rEnd], [dStart, dEnd]) => rStart <= dStart && rEnd >= dEnd,
    functor: (a: Type, b: Type) =>
      Type.combine(a.getRangeOf().isDate(), b.isDate(), t.boolean()),
  },
  // Date stuff (TODO operator overloading)
  dateequals: {
    argCount: 2,
    fn: ([aStart, aEnd], [bStart, bEnd]) => aStart === bStart && aEnd === bEnd,
    functor: dateCmpFunctor,
  },
  dategte: {
    argCount: 2,
    fn: ([aStart], [bStart]) => aStart >= bStart,
    functor: dateCmpFunctor,
  },
  // Reduce funcs
  total: {
    argCount: 1,
    argCardinalities: [2],
    fn: (nums: number[]) => nums.reduce((a, b) => a + b, 0),
    functor: (nums: Type) => nums.reduced().isScalar('number'),
  },
};
