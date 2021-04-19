import { Type } from '../type';

export interface BuiltinSpec {
  name: string;
  argCount: number;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  fn: (...args: any[]) => any;
  functor: (...types: Type[]) => Type;
}

const binopFunctor = (...types: Type[]) =>
  types.reduce((a, b) => a.isScalar('number').sameAs(b).withUnit(b.unit));

const dateCmpFunctor = (left: Type, right: Type): Type =>
  Type.combine(
    left.isDate(),
    right.sameAs(left),
    Type.build({ type: 'boolean', columnSize: left.columnSize })
  );

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
        Type.build({ type: 'boolean', columnSize: a.columnSize })
      ),
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
};

export const hasBuiltin = (builtinName: string) =>
  Object.hasOwnProperty.call(builtins, builtinName);
