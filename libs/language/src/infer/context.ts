import { AnyMapping, anyMappingToMap } from '@decipad/utils';

import { AST, ExternalDataMap } from '..';
import { Type, SerializedType } from '../type';
import { Stack } from '../stack';
import { Result } from '../result';

export interface Context {
  stack: Stack<Type>;
  functionDefinitions: Map<string, AST.FunctionDefinition>;
  previous?: Type;
  inAssignment: string | null;
  nodeTypes: Map<AST.Node, Type>;
  externalData: ExternalDataMap;
  previousStatement?: SerializedType;
}

interface MakeContextArgs {
  initialGlobalScope: AnyMapping<Type>;
  externalData: AnyMapping<Result>;
  inAssignment: string | null;
}

export const makeContext = ({
  initialGlobalScope = new Map(),
  externalData = new Map(),
  inAssignment = null,
}: Partial<MakeContextArgs> = {}): Context => {
  return {
    stack: new Stack(initialGlobalScope),
    functionDefinitions: new Map(),
    inAssignment,
    nodeTypes: new Map(),
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
