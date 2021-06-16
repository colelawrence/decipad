import { Type, InferError } from '../type';
import { Stack } from '../stack';
import defaultFetch from '../data/default-fetch';

export interface Context {
  stack: Stack<Type>;
  functionDefinitions: Map<string, AST.FunctionDefinition>;
  inTable: boolean;
  errors: InferError[];
  fetch: ExternalData.FetchFunction;
}

export const makeContext = (
  mapInit?: Array<[string, Type]>,
  fetch = defaultFetch
): Context => {
  return {
    stack: new Stack(mapInit),
    functionDefinitions: new Map(),
    inTable: false,
    errors: [],
    fetch,
  };
};
