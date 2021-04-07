import { Type } from './type';
import { Scalar, Column, SimpleValue } from './interpreter/Value';
import { getDefined } from './utils';

export interface BuiltinSpec {
  name: string;
  argCount: number;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  fn: (...args: any[]) => any;
  functor: (...types: Type[]) => Type;
}

const basicFunctor = (...types: Type[]) =>
  types.reduce((a, b) => a.hasType('number').sameAs(b).withUnit(b.unit));

const dateCmpFunctor = (left: Type, right: Type): Type =>
  Type.combine(
    left.isDate(),
    right.sameAs(left),
    Type.build({ type: 'boolean', columnSize: left.columnSize })
  );

const cmpFunctor = (left: Type, right: Type): Type =>
  Type.combine(
    left.hasType('number').sameAs(right),
    Type.build({
      type: 'boolean',
      columnSize: left.columnSize,
    })
  );

export const builtins: Record<string, BuiltinSpec> = {
  sqrt: {
    name: 'sqrt',
    argCount: 1,
    fn: (n) => Math.sqrt(n as number),
    functor: basicFunctor,
  },
  '+': {
    name: '+',
    argCount: 2,
    fn: (a, b) => a + b,
    functor: basicFunctor,
  },
  '-': {
    name: '-',
    argCount: 2,
    fn: (a, b) => a - b,
    functor: basicFunctor,
  },
  '*': {
    name: '*',
    argCount: 2,
    fn: (a, b) => a * b,
    functor: (a, b) =>
      a.hasType('number').sameAs(b).isNotRange().multiplyUnit(b.unit),
  },
  '/': {
    name: '/',
    argCount: 2,
    fn: (a, b) => a / b,
    functor: (a, b) =>
      a.hasType('number').sameAs(b).isNotRange().divideUnit(b.unit),
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
      Type.combine(
        a.hasType('boolean'),
        a.sameColumnSizeAs(b).sameColumnSizeAs(c),
        b.sameAs(c)
      ),
  },
  // Range stuff
  contains: {
    name: 'contains',
    argCount: 2,
    fn: ([bStart, bEnd], a) => a >= bStart && a <= bEnd,
    functor: (a: Type, b: Type) =>
      Type.combine(
        a.hasType('number').isRange(),
        b.hasType('number'),
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
    fn: ([aStart, _aEnd], [bStart, _bEnd]) => aStart >= bStart,
    functor: dateCmpFunctor,
  },
};

const raiseDimensions = (
  values: SimpleValue[]
): [Column[] | (Scalar | Range)[], boolean] => {
  const column = values.find((v) => v instanceof Column);
  if (column != null) {
    return [values.map((v) => v.withRowCount(column.rowCount as number)), true];
  } else {
    return [values.map((v) => v as Scalar | Range), false];
  }
};

export const callBuiltin = (
  builtinName: string,
  ...givenArgs: SimpleValue[]
): SimpleValue => {
  const builtinSpec: BuiltinSpec = getDefined(builtins[builtinName]);

  const [args, isColumn] = raiseDimensions(givenArgs);

  if (isColumn) {
    const ret = [];
    const columnArgs = args as Column[];

    for (let i = 0; i < columnArgs[0].rowCount; i++) {
      const row = columnArgs.map((a) => a.atIndex(i).getData());
      ret.push(Scalar.fromValue(builtinSpec.fn(...row)));
    }

    return Column.fromValues(ret);
  } else {
    const scalarArgs = args as Scalar[];

    return Scalar.fromValue(
      builtinSpec.fn(...scalarArgs.map((v) => v.getData() as number))
    );
  }
};

export const hasBuiltin = (builtinName: string) => builtinName in builtins;
