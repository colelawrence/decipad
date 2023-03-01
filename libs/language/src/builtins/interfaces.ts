import type { Value } from '../value';
import type { Type } from '../type';
import type { AST } from '../parser';
import type { Context } from '../infer';
import type { Realm } from '../interpreter';

export type Functor = (
  types: Type[],
  values?: AST.Expression[],
  context?: Context
) => Type;

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
  noAutoconvert?: boolean;
  autoConvertArgs?: boolean;
  absoluteNumberInput?: boolean;
  hidden?: boolean;
  // Variant that operates on Value specifically

  fnValuesNoAutomap?: (
    args: Value[],
    argTypes?: Type[],
    realm?: Realm
  ) => Value;
  fnValues?: (args: Value[], argTypes?: Type[], realm?: Realm) => Value;
  functor?: Functor;
  functionSignature?: string;
  functorNoAutomap?: (
    types: Type[],
    values?: AST.Expression[],
    context?: Context
  ) => Type;
  operatorKind?: 'infix' | 'prefix';
  explanation?: string;
}
