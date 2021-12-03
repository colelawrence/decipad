import { AST, ExternalData, ExternalDataMap, InjectableExternalData } from '..';
import { Type } from '../type';
import { Stack } from '../stack';
import defaultFetch from '../data/default-fetch';
import { AnyMapping, anyMappingToMap } from '../utils';

export interface Context {
  stack: Stack<Type>;
  functionDefinitions: Map<string, AST.FunctionDefinition>;
  hasPrevious: boolean;
  inAssignment: string | null;
  nodeTypes: Map<AST.Node, Type>;
  fetch: ExternalData.FetchFunction;
  externalData: ExternalDataMap;
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
    hasPrevious: false,
    inAssignment,
    nodeTypes: new Map(),
    fetch,
    externalData: anyMappingToMap(externalData),
  };
};

/** Push the stack and set Context.hasPrevious for the duration of `fn` */
export const pushStackAndPrevious = async <T>(
  ctx: Context,
  fn: () => Promise<T>
): Promise<T> => {
  const savedHasPrevious = ctx.hasPrevious;
  ctx.hasPrevious = true;
  try {
    return await ctx.stack.withPush(fn);
  } finally {
    ctx.hasPrevious = savedHasPrevious;
  }
};
