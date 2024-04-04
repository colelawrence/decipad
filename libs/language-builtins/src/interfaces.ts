import { type PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Value, Type, AST, ContextUtils } from '@decipad/language-types';
import { type BuiltinContextUtils } from './types';

export type Functor = (
  types: Type[],
  values: AST.Expression[],
  utils: ContextUtils
) => Type | Promise<Type>;

export interface GenericBuiltinSpec {
  explanation?: string;
  syntax?: string;
  example?: string;
  formulaGroup?: string;
  operatorKind?: 'infix' | 'prefix';
  hidden?: boolean;
}

export interface AliasBuiltinSpec extends GenericBuiltinSpec {
  aliasFor: string;
}

export interface FullBuiltinSpec extends GenericBuiltinSpec {
  aliasFor?: undefined;
  argCount?: number | number[];
  /**
   * Use this to indicate desired cardinality per argument (1 for 1D, 2 for 2D, etc.)
   * The cardinality of the corresponding args passed to fn and functor will be raised from the default 1.
   */
  argCardinalities?: number[];
  isReducer?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn?: (args: any[], types?: Type[]) => any;
  likesUnknowns?: boolean;
  noAutoconvert?: boolean;
  autoConvertArgs?: boolean;
  absoluteNumberInput?: boolean;
  coerceToColumn?: boolean;

  fnValuesNoAutomap?: (
    args: Value.Value[],
    argTypes: Type[],
    utils: BuiltinContextUtils
  ) => PromiseOrType<Value.Value>;
  fnValues?: (
    args: Value.Value[],
    argTypes: Type[],
    utils: BuiltinContextUtils
  ) => PromiseOrType<Value.Value>;
  functor?: Functor;
  functionSignature?: string;
  functorNoAutomap?: (
    types: Type[],
    values: AST.Expression[],
    utils: BuiltinContextUtils
  ) => PromiseOrType<Type>;
  toMathML?: (args: string[]) => string;
}

export type BuiltinSpec = FullBuiltinSpec | AliasBuiltinSpec;
