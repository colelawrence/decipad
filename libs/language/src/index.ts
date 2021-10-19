/* istanbul ignore file: just config and re-export */
import { Interpreter } from './interpreter';
import { SimpleValue } from './interpreter/Value';
import { Type, build as t, serializeType, SerializedType } from './type';
import { builtins } from './builtins';

export { tokenize } from './grammar';
export { parse, AST, Parser } from './parser';
export {
  inferTargetStatement,
  makeContext,
  getContextFromProgram,
} from './infer';
export type { Context } from './infer';
export { Interpreter } from './interpreter';
export * from './run';
export { Scalar, Date, Range, TimeQuantity, Column } from './interpreter/Value';

export { prettyPrintAST } from './parser/utils';
export type { SerializedType } from './type';
export {
  Type,
  build as buildType,
  deserializeType,
  serializeType,
} from './type';
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

export interface AutocompleteName {
  kind: 'function' | 'variable';
  type: SerializedType;
  name: string;
}

let cachedBuiltins: AutocompleteName[] | null = null;
/* Always returns the same array. It's a function, so as to avoid an import cycle */
export const getBuiltinsForAutocomplete = (): AutocompleteName[] => {
  if (!cachedBuiltins) {
    cachedBuiltins = Object.keys(builtins).map((name) => ({
      kind: 'function',
      type: serializeType(t.functionPlaceholder()),
      name,
    }));
  }

  return cachedBuiltins;
};
