import { Value, AnyValue } from '../interpreter/Value';
import { Type } from '../type';
import { AST } from '../parser';
import { Context } from '../infer';
import { Realm } from '../interpreter';

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
  // Variant that operates on Value specifically

  fnValuesNoAutomap?: (
    args: Value[],
    argTypes?: Type[],
    realm?: Realm
  ) => AnyValue;
  fnValues?: (args: AnyValue[], argTypes?: Type[], realm?: Realm) => AnyValue;
  functor?: (
    types: Type[],
    values?: AST.Expression[],
    context?: Context
  ) => Type;
  functorNoAutomap?: (
    types: Type[],
    values?: AST.Expression[],
    context?: Context
  ) => Type;
}
