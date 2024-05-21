import type { AST } from '..';
import type { Value } from './Value';

export interface FunctionValue extends Value {
  argumentNames: string[];
  body: AST.Block;
}
