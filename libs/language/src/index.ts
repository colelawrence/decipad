/* istanbul ignore file: just config and re-export */
import { Value } from './interpreter/Value';
import {
  Type,
  build as t,
  serializeType,
  SerializedType,
  Units,
  Unit,
  units,
} from './type';
import { builtinsForAutocomplete } from './builtins';

export { units };
export { tokenize, tokenRules } from './grammar';
export * from './grammar/containmentCounting';
export { parse, AST, Parser } from './parser';
export { inferBlock, makeContext } from './infer';
export type { Context } from './infer';
export { Interpreter } from './interpreter';
export * from './run';
export { Scalar, Date, Range, TimeQuantity, Column } from './interpreter/Value';
export { setErrorReporter } from './reporting';

export { prettyPrintAST } from './parser/utils';
export type { SerializedType, SerializedTypeKind } from './type';
export type { Unit, Units };
export {
  Type,
  build as buildType,
  deserializeType,
  InferError,
  serializeType,
  stringifyUnits,
} from './type';
export { Time } from './date';
export { ExternalData } from './data';
export * from './computer';

export interface InjectableExternalData {
  type: Type;
  value: Value;
}
export type ExternalDataMap = Map<string, InjectableExternalData>;

export interface AutocompleteName {
  kind: 'function' | 'variable';
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
