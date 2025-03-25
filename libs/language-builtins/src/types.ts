// eslint-disable-next-line no-restricted-imports
import type { ContextUtils, Type } from '@decipad/language-types';
import type {
  AST,
  FormulaGroup,
  Value,
  Type as TypeType,
} from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';

export type CallBuiltinFunctor = (
  ctx: BuiltinContextUtils,
  funcName: string,
  argTypes: Type[],
  node: AST.Expression[],
  op?: FullBuiltinSpec
) => Promise<Type>;

export type CallBuiltin = (
  ctx: BuiltinContextUtils,
  funcName: string,
  argsBeforeConvert: Value.Value[],
  argTypes: Type[],
  returnType: Type,
  node: AST.Expression[],
  op?: FullBuiltinSpec
) => Promise<Value.Value>;

export type BuiltinContextUtils = ContextUtils & {
  callBuiltinFunctor: CallBuiltinFunctor;
  callBuiltin: CallBuiltin;
};

export type Functor = (
  types: Type[],
  values: AST.Expression[],
  utils: BuiltinContextUtils
) => TypeType | Promise<TypeType>;

export type Evaluator = (
  args: Value.Value[],
  argTypes: Type[],
  utils: BuiltinContextUtils,
  valueNodes: AST.Expression[]
) => PromiseOrType<Value.Value>;

export interface GenericBuiltinSpec {
  explanation?: string;
  syntax?: string;
  example?: string;
  formulaGroup?: FormulaGroup;
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
  argCardinalities?: Array<number[]>;
  isReducer?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn?: (args: any[], types?: Type[]) => any;
  likesUnknowns?: boolean;
  noAutoconvert?: boolean;
  autoConvertArgs?: boolean;
  absoluteNumberInput?: boolean;
  coerceToColumn?: boolean;

  fnValuesNoAutomap?: Evaluator;
  fnValues?: Evaluator;
  functor?: Functor;
  functionSignature?: string;
  functorNoAutomap?: (
    types: Type[],
    values: AST.Expression[],
    utils: BuiltinContextUtils
  ) => PromiseOrType<TypeType>;
  toMathML?: (args: string[]) => string;
}

export type BuiltinSpec = FullBuiltinSpec | AliasBuiltinSpec;
