import * as tf from "@tensorflow/tfjs-core";
import { Stack } from "../stack";
import { Table } from './types'

// The name "realm" comes from V8.
// It's passed around during interpretation and
// contains a stack of variables and a map of
// function names to AST.FunctionDefinition.
export class Realm {
  stack = new Stack<tf.Tensor>();
  tables = new Map<string, Table>();
  functions = new Map<string, AST.FunctionDefinition>();
  previousValue: tf.Tensor | null = null
}
