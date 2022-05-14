import { AnyMapping, anyMappingToMap } from '@decipad/utils';

import { AST, ExternalData, ExternalDataMap, InjectableExternalData } from '..';
import { Type, SerializedType } from '../type';
import { Stack } from '../stack';
import defaultFetch from '../data/default-fetch';

export interface Context {
  stack: Stack<Type>;
  functionDefinitions: Map<string, AST.FunctionDefinition>;
  previous?: Type;
  inAssignment: string | null;
  nodeTypes: Map<AST.Node, Type>;
  fetch: ExternalData.FetchFunction;
  externalData: ExternalDataMap;
  previousStatement?: SerializedType;
}

interface MakeContextArgs {
  initialGlobalScope: AnyMapping<Type>;
  fetch: ExternalData.FetchFunction;
  externalData: AnyMapping<InjectableExternalData>;
  inAssignment: string | null;
}

export const makeContext = ({
  initialGlobalScope = new Map(),
  fetch = defaultFetch,
  externalData = new Map(),
  inAssignment = null,
}: Partial<MakeContextArgs> = {}): Context => {
  return {
    stack: new Stack(initialGlobalScope),
    functionDefinitions: new Map(),
    inAssignment,
    nodeTypes: new Map(),
    fetch,
    externalData: anyMappingToMap(externalData),
  };
};

/** Push the stack and set Context.previous for the duration of `fn` */
export const pushStackAndPrevious = async <T>(
  ctx: Context,
  fn: () => Promise<T>
): Promise<T> => {
  const previousPrevious = ctx.previous;
  try {
    return await ctx.stack.withPush(fn);
  } finally {
    ctx.previous = previousPrevious;
  }
};
