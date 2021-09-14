import { AST, ExternalDataMap, Context } from '..';
import { Stack } from '../stack';
import { Value } from './Value';

import { FetchFunction } from '../data/external-data-types';

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
export class Realm {
  stack = new Stack<Value>();
  functions = new Map<string, AST.FunctionDefinition>();
  previousValue: Value | null = null;
  inferContext: Context;

  get fetch() {
    return this.inferContext.fetch;
  }
  set fetch(newFetch: FetchFunction) {
    this.inferContext.fetch = newFetch;
  }

  get externalData() {
    return this.inferContext.externalData;
  }
  set externalData(value: ExternalDataMap) {
    this.inferContext.externalData = value;
  }

  constructor(context: Context) {
    this.inferContext = context;
  }
}
