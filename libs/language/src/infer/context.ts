import { Type, InferError } from '../type';
import { Stack } from '../stack';

export interface Context {
  stack: Stack<Type>;
  tables: Map<string, Type>;
  functionDefinitions: Map<string, AST.FunctionDefinition>;
  inTable: boolean;
  errors: InferError[];
}

export const makeContext = (mapInit?: Array<[string, Type]>): Context => {
  return {
    stack: new Stack(mapInit),
    tables: new Map(),
    functionDefinitions: new Map(),
    inTable: false,
    errors: [],
  };
};
