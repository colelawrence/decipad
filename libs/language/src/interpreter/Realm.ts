import { AST, ExternalData, ExternalDataMap, InjectableExternalData } from '..';
import { Stack } from '../stack';
import { Value } from './Value';
import defaultFetch from '../data/default-fetch';
import { AnyMapping, anyMappingToMap } from '../utils';

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
interface RealmConstructorArgs {
  fetch: ExternalData.FetchFunction;
  externalData: AnyMapping<InjectableExternalData>;
}

export class Realm {
  stack = new Stack<Value>();
  functions = new Map<string, AST.FunctionDefinition>();
  previousValue: Value | null = null;
  fetch: ExternalData.FetchFunction;
  externalData: ExternalDataMap;

  constructor({
    fetch = defaultFetch,
    externalData = new Map(),
  }: Partial<RealmConstructorArgs> = {}) {
    this.fetch = fetch;
    this.externalData = anyMappingToMap(externalData);
  }
}
