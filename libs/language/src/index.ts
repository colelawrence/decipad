/* istanbul ignore file: just config and re-export */
import { Interpreter } from './interpreter';
import { SimpleValue } from './interpreter/Value';
import { Type } from './type';

export { parse, AST, Parser } from './parser';
export {
  inferTargetStatement,
  makeContext,
  getContextFromProgram,
} from './infer';
export type { Context } from './infer';
export { run, Interpreter } from './interpreter';
export { Scalar, Date, Range, TimeQuantity, Column } from './interpreter/Value';

export { Type, build as buildType } from './type';
export { Time } from './date';
export { ExternalData } from './data';
export * from './computer';

export interface Result {
  type: Type;
  value: Interpreter.Result;
}

export interface InjectableExternalData {
  type: Type;
  value: SimpleValue;
}
export type ExternalDataMap = Map<string, InjectableExternalData>;

export type { SimpleValue };
