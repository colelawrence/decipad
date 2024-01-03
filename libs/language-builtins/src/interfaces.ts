import { PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Value, Type, AST, ContextUtils } from '@decipad/language-types';

export type Functor = (
  types: Type[],
  values: AST.Expression[],
  utils: ContextUtils
) => Type | Promise<Type>;

export interface BuiltinSpec {
  argCount?: number | number[];
  /**
   * Use this to indicate desired cardinality per argument (1 for 1D, 2 for 2D, etc.)
   * The cardinality of the corresponding args passed to fn and functor will be raised from the default 1.
   */
  argCardinalities?: number[];
  isReducer?: boolean;
  aliasFor?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn?: (args: any[], types?: Type[]) => any;
  likesUnknowns?: boolean;
  noAutoconvert?: boolean;
  autoConvertArgs?: boolean;
  absoluteNumberInput?: boolean;
  coerceToColumn?: boolean;
  hidden?: boolean;
  // Variant that operates on Value specifically

  fnValuesNoAutomap?: (
    args: Value.Value[],
    argTypes: Type[],
    utils: ContextUtils
  ) => PromiseOrType<Value.Value>;
  fnValues?: (
    args: Value.Value[],
    argTypes: Type[],
    utils: ContextUtils
  ) => PromiseOrType<Value.Value>;
  functor?: Functor;
  functionSignature?: string;
  functorNoAutomap?: (
    types: Type[],
    values: AST.Expression[],
    utils: ContextUtils
  ) => PromiseOrType<Type>;
  operatorKind?: 'infix' | 'prefix';
  explanation?: string;
  syntax?: string;
  example?: string;
  formulaGroup?: string;
}
