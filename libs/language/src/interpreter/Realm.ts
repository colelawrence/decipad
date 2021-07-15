import { AST, ExternalData } from '..';
import { Stack } from '../stack';
import { Value } from './Value';
import defaultFetch from '../data/default-fetch';

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
export class Realm {
  stack = new Stack<Value>();
  functions = new Map<string, AST.FunctionDefinition>();
  previousValue: Value | null = null;
  fetch: ExternalData.FetchFunction;

  constructor(fetch = defaultFetch) {
    this.fetch = fetch;
  }
}
