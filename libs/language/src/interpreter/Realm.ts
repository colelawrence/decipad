import { Stack } from '../stack';
import { Value, Column, Table } from './Value';

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
export class Realm {
  stack = new Stack<Value | Column>();
  tables = new Map<string, Table>();
  functions = new Map<string, AST.FunctionDefinition>();
  previousValue: Value | null = null;
}
