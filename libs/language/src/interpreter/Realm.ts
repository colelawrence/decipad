import { Value } from './Value';

import { AST, ExternalDataMap, Context } from '..';
import { Stack } from '../stack';
import { getDefined } from '../utils';

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
export class Realm {
  stack = new Stack<Value>();
  functions = new Map<string, AST.FunctionDefinition>();
  previousValue: Value | null = null;
  inferContext: Context;

  get externalData() {
    return this.inferContext.externalData;
  }
  set externalData(value: ExternalDataMap) {
    this.inferContext.externalData = value;
  }

  getTypeAt(node: AST.Node) {
    return getDefined(
      this.inferContext.nodeTypes.get(node),
      `Could not find type for ${node.type}`
    );
  }

  constructor(context: Context) {
    this.inferContext = context;
  }
}
