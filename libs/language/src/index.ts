/* istanbul ignore file: just config and re-export */
import { builtinsForAutocomplete } from './builtins';
import { Value } from './interpreter/Value';
import {
  build as t,
  SerializedType,
  serializeType,
  Type,
  Unit,
  Units,
  units,
} from './type';

export * from './computer';
export { ExternalData } from './data';
export { Time } from './date';
export {
  identifierRegExpGlobal,
  STATEMENT_SEP_TOKEN_TYPE,
  tokenize,
  tokenRules,
} from './grammar';
export * from './grammar/containmentCounting';
export { inferBlock, makeContext } from './infer';
export type { Context } from './infer';
export { Interpreter } from './interpreter';
export { Column, Date, Range, Row, Scalar, Table } from './interpreter/Value';
export { AST, parse, Parser, SyntaxError } from './parser';
export { prettyPrintAST } from './parser/utils';
export { setErrorReporter } from './reporting';
export type { OneResult } from './result';
export * from './run';
export {
  build as buildType,
  convertToMultiplierUnit,
  deserializeType,
  deserializeUnit,
  InferError,
  serializeType,
  serializeUnit,
  stringifyUnits,
  Type,
} from './type';
export type {
  SerializedType,
  SerializedTypeKind,
  SerializedUnits,
} from './type';
export { isExpression } from './utils';
export { units };
export type { Unit, Units };

export interface InjectableExternalData {
  type: Type;
  value: Value;
}
export type ExternalDataMap = Map<string, InjectableExternalData>;

export interface AutocompleteName {
  kind: 'function' | 'variable' | 'column';
  type: SerializedType;
  name: string;
}

let cachedBuiltins: AutocompleteName[] | null = null;
/* Always returns the same array. It's a function, so as to avoid an import cycle */
export const getBuiltinsForAutocomplete = (): AutocompleteName[] => {
  if (!cachedBuiltins) {
    cachedBuiltins = builtinsForAutocomplete.map((name) => ({
      kind: 'function',
      type: serializeType(t.functionPlaceholder()),
      name,
    }));
  }

  return cachedBuiltins;
};
