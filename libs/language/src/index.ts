/* istanbul ignore file: just config and re-export */
import { Interpreter } from './interpreter';
import { Type } from './type';

export { parse, AST, Parser } from './parser';
export { inferTargetStatement } from './infer';
export { run, Interpreter } from './interpreter';
export { Type, build as buildType } from './type';
export { Time } from './date';
export { ExternalData } from './data';
export * from './computer';

export interface Result {
  type: Type;
  value: Interpreter.Result;
}
