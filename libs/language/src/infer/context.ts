import { AST, ExternalData, ExternalDataMap, InjectableExternalData } from '..';
import { Type } from '../type';
import { Stack } from '../stack';
import defaultFetch from '../data/default-fetch';
import { AnyMapping, anyMappingToMap } from '../utils';

export interface Context {
  stack: Stack<Type>;
  functionDefinitions: Map<string, AST.FunctionDefinition>;
  hasPrevious: boolean;
  fetch: ExternalData.FetchFunction;
  externalData: ExternalDataMap;
}

interface MakeContextArgs {
  initialGlobalScope: AnyMapping<Type>;
  fetch: ExternalData.FetchFunction;
  externalData: AnyMapping<InjectableExternalData>;
}

export const makeContext = ({
  initialGlobalScope = new Map(),
  fetch = defaultFetch,
  externalData = new Map(),
}: Partial<MakeContextArgs> = {}): Context => {
  return {
    stack: new Stack(initialGlobalScope),
    functionDefinitions: new Map(),
    hasPrevious: false,
    fetch,
    externalData: anyMappingToMap(externalData),
  };
};
