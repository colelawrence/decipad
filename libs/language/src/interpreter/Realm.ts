import { Stack } from '../stack';
import { Scalar, SimpleValue } from './Value';

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
export class Realm {
  stack = new Stack<SimpleValue>();
  functions = new Map<string, AST.FunctionDefinition>();
  previousValue: Scalar | null = null;
}
