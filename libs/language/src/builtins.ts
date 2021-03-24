import * as tf from '@tensorflow/tfjs-core';
import { Type } from './type';

// Can make this a union, so we can add custom functions as well.
// & string excludes symbol and number keys.
type Builtin = keyof typeof tf & string;

interface Builtins {
  [count: number]: { [fname: string]: Builtin };
}

export const builtins: Builtins = {
  1: {
    sqrt: 'sqrt',
  },
  2: {
    '+': 'add',
    '-': 'sub',
    '/': 'div',
    '*': 'mul',
    '<': 'less',
    '>': 'greater',
    '<=': 'lessEqual',
    '>=': 'greaterEqual',
  },
  3: {
    if: 'where',
  },
};

interface BuiltinFunctors {
  1: {
    [fname: string]: (A: Type) => Type;
  };
  2: {
    [fname: string]: (A: Type, B: Type) => Type;
  };
  3: {
    [fname: string]: (A: Type, B: Type, C: Type) => Type;
  };
}

// Allow the comma operator to keep these in one line
const relativeCompareOp = (A: Type, B: Type) =>
  Type.combine(A.hasType('number', 'string').sameAs(B), Type.Boolean);

export const functors: BuiltinFunctors = {
  1: {
    sqrt: (N) => N.hasType('number'),
  },
  2: {
    '+': (A, B) => A.hasType('number', 'string').sameAs(B).withUnit(B.unit),
    '-': (A, B) => A.hasType('number').sameAs(B).withUnit(B.unit),
    '/': (A, B) => A.hasType('number').sameAs(B).divideUnit(B.unit),
    '*': (A, B) => A.hasType('number').sameAs(B).multiplyUnit(B.unit),
    '>': relativeCompareOp,
    '<': relativeCompareOp,
    '>=': relativeCompareOp,
    '<=': relativeCompareOp,
    '==': (A, B) => Type.combine(A.sameAs(B), Type.Boolean),
  },
  3: {
    if: (Cond, Then, Else) =>
      Type.combine(Cond.hasType('boolean'), Then.sameAs(Else)),
  },
};
