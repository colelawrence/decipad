import { Type, FunctionType, InferError } from "../type";
import { Stack } from "../stack";

export interface Context {
  stack: Stack<Type>;
  functions: Map<string, FunctionType>;
  functionDefinitions: Map<string, AST.FunctionDefinition>;
  errors: InferError[];
}

export const makeContext = (mapInit?: Array<[string, Type]>): Context => {
  return {
    stack: new Stack(mapInit),
    functions: new Map(),
    functionDefinitions: new Map(),
    errors: [],
  };
};
