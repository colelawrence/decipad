import * as tf from "@tensorflow/tfjs-core";
import { Type } from "./type";

// Can make this a union, so we can add custom functions as well.
// & string excludes symbol and number keys.
type Builtin = keyof typeof tf & string;

interface Builtins {
  binary: { [fname: string]: Builtin };
  unary: { [fname: string]: Builtin };
}

export const builtins: Builtins = {
  binary: {
    "+": "add",
    "-": "sub",
    "/": "div",
    "*": "mul",
    "<": "less",
    ">": "greater",
    "<=": "lessEqual",
    ">=": "greaterEqual",
  },
  unary: {
    sqrt: "sqrt",
  },
};

interface BuiltinFunctors {
  binary: {
    [fname: string]: (A: Type, B: Type) => Type;
  };
  unary: {
    [fname: string]: (A: Type) => Type;
  };
}

// Allow the comma operator to keep these in one line
/* eslint-disable no-sequences */
const relativeCompareOp = (A: Type, B: Type) => (
  A.hasType("number", "string").sameAs(B), Type.Boolean
);

export const functors: BuiltinFunctors = {
  binary: {
    "+": (A, B) => A.hasType("number", "string").sameAs(B).withUnit(B.unit),
    "-": (A, B) => A.hasType("number", "string").sameAs(B).withUnit(B.unit),
    "/": (A, B) => A.hasType("number", "string").sameAs(B).divideUnit(B.unit),
    "*": (A, B) => A.hasType("number", "string").sameAs(B).multiplyUnit(B.unit),
    ">": relativeCompareOp,
    "<": relativeCompareOp,
    ">=": relativeCompareOp,
    "<=": relativeCompareOp,
    "==": (A, B) => Type.combine(A.sameAs(B), Type.Boolean),
  },
  unary: {
    sqrt: (N) => N.hasType("number"),
  },
};
/* eslint-enable no-sequences */
